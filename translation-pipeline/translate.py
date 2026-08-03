#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Pipeline de traduction automatique d'un EPUB (EN -> FR par defaut).

Ce script transforme, par logiciel, le document fourni par l'utilisateur :
  1. Extraction de l'EPUB
  2. Remplacements de noms demandes (Shirakawa->Shiratama,
     Amatsuka Ten-ai->Basori Tiara, Yakisoba->Yakishio, Nuku-chan->Nukkun)
  3. Traduction automatique (Argos Translate, moteur local hors ligne)
  4. Remplacements de secours apres traduction
  5. Reconstruction de l'EPUB (langue de destination, police sans-serif)
  6. Generation d'un PDF (police sans-serif)

Configuration par variables d'environnement :
  EPUB_SRC   chemin de l'EPUB source      (defaut : ./makeine_vol9.epub)
  OUT_DIR    dossier de sortie            (defaut : ./output)
  FROM_CODE  langue source                (defaut : en)
  TO_CODE    langue cible                 (defaut : fr)
  BASE_NAME  nom de base des fichiers     (defaut : Makeine_vol9_<TO>_sans-serif)
"""
import os
import pathlib
import re
import subprocess
import sys
import zipfile

# ---------------------------------------------------------------- compatibilite stanza hors ligne
# a) ne pas telecharger resources.json si la copie locale existe deja (mode hors ligne)
try:
    import stanza.pipeline.core as _spc

    _orig_dl_res = _spc.download_resources_json

    def _dl_res_offline_ok(dir_, **kw):
        try:
            return _orig_dl_res(dir_, **kw)
        except Exception:
            if os.path.exists(os.path.join(dir_, "resources.json")):
                return None  # mode hors ligne : on garde la version embarquee
            raise

    _spc.download_resources_json = _dl_res_offline_ok
except Exception:
    pass

# b) reparer la compatibilite des anciens modeles stanza embarques dans
#    les paquets Argos 1.9 (feature "all_caps" supprimee de stanza 1.10)
try:
    import numpy as np
    import stanza.models.tokenization.data as _tk_data
    from stanza.models.tokenization.data import NUMERIC_RE

    _orig_pts = _tk_data.TokenizationDataset.para_to_sentences

    def _normalize_feat_funcs(funcs_args):
        return funcs_args

    def _build_funcs_compat(self, funcs):
        funcs_out = []
        for feat_func in self.args["feat_funcs"]:
            if feat_func in ("end_of_para", "start_of_para"):
                continue
            if feat_func == "space_before":
                func = lambda x: 1 if x.startswith(" ") else 0
            elif feat_func == "capitalized":
                func = lambda x: 1 if x[0].isupper() else 0
            elif feat_func == "numeric":
                func = lambda x: 1 if (NUMERIC_RE.match(x) is not None) else 0
            elif feat_func == "all_caps":  # ancien modele : retro-compatibilite
                func = lambda x: 1 if x.isupper() else 0
            else:
                raise ValueError('Feature function "{}" is undefined.'.format(feat_func))
            funcs_out.append(func)
        return funcs_out

    def _para_to_sentences_compat(self, para):
        res = []
        funcs = _build_funcs_compat(self, self.args["feat_funcs"])
        composite_func = lambda x: [f(x) for f in funcs]

        def process_sentence(sent_units, sent_labels, sent_feats):
            return (
                np.array([self.vocab.unit2id(y) for y in sent_units]),
                np.array(sent_labels),
                np.array(sent_feats),
                list(sent_units),
            )

        use_end_of_para = "end_of_para" in self.args["feat_funcs"]
        use_start_of_para = "start_of_para" in self.args["feat_funcs"]
        use_dictionary = self.args.get("use_dictionary") and getattr(self, "dictionary", None)
        current_units, current_labels, current_feats = [], [], []
        for i, (unit, label) in enumerate(para):
            feats = composite_func(unit)
            if use_end_of_para:
                feats.append(1 if i == len(para) - 1 else 0)
            if use_start_of_para:
                feats.append(1 if i == 0 else 0)
            if use_dictionary:
                feats = feats + self.extract_dict_feat(para, i)
            current_units.append(unit)
            current_labels.append(label)
            current_feats.append(feats)
            if not self.eval and (label == 2 or label == 4):
                if len(current_units) <= self.args["max_seqlen"]:
                    res.append(process_sentence(current_units, current_labels, current_feats))
                current_units, current_labels, current_feats = [], [], []
        if len(current_units) > 0:
            if self.eval or len(current_units) <= self.args["max_seqlen"]:
                res.append(process_sentence(current_units, current_labels, current_feats))
        return res

    _tk_data.TokenizationDataset.para_to_sentences = _para_to_sentences_compat
except Exception:
    pass

from bs4 import BeautifulSoup, NavigableString  # noqa: E402

ROOT = pathlib.Path.cwd()
EPUB = pathlib.Path(os.environ.get("EPUB_SRC", ROOT / "makeine_vol9.epub"))
OUTDIR = pathlib.Path(os.environ.get("OUT_DIR", ROOT / "output"))
FROM_CODE = os.environ.get("FROM_CODE", "en")
TO_CODE = os.environ.get("TO_CODE", "fr")
BASE_NAME = os.environ.get("BASE_NAME", f"Makeine_vol9_{TO_CODE.upper()}_sans-serif")
SRC = OUTDIR / "_build" / "src"
OUTDIR.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------------------- remplacements
REPLACEMENTS = [
    (r"Amatsuka[ \u00a0]Ten[-\u2011]ai", "Basori Tiara"),   # Amatsuka Ten-ai
    (r"Ten[-\u2011]ai[ \u00a0]Amatsuka", "Basori Tiara"),   # ordre inverse
    (r"\bTen[-\u2011]ai\b", "Tiara"),                       # prenom seul
    (r"\bAmatsuka\b", "Basori"),                            # nom de famille seul
    (r"\bShirakawa\b", "Shiratama"),
    (r"Yakisoba", "Yakishio"),  # forme capitalisee : le plat "yakisoba" (minuscules) est conserve
    (r"Nuku[-\u2011]chan", "Nukkun"),
    (r"Nuku[-\u2011]Chan", "Nukkun"),
]
POST_REPLACEMENTS = [
    (r"\b[Ss]hirakawa\b", "Shiratama"),
    (r"Amatsuka[ \u00a0]Ten[-\u2011]ai", "Basori Tiara"),
    (r"\b[Tt]en[-\u2011]ai\b", "Tiara"),
    (r"\b[Aa]matsuka\b", "Basori"),
    (r"Yakisoba", "Yakishio"),
    (r"Nuku[-\u2011][Cc]han", "Nukkun"),
]
stats = {"replacements": 0, "post_replacements": 0, "chunks": 0, "failed_chunks": 0}


def apply_replacements(text, rules, key):
    for pat, rep in rules:
        text, n = re.subn(pat, rep, text)
        stats[key] += n
    return text


# ---------------------------------------------------------------- extraction
if SRC.exists():
    import shutil
    shutil.rmtree(SRC)
SRC.mkdir(parents=True)
with zipfile.ZipFile(EPUB) as z:
    z.extractall(SRC)
print(f"[ok] EPUB extrait : {EPUB} -> {SRC}")

opf_path = SRC / "OEBPS" / "content.opf"
opf = opf_path.read_text(encoding="utf-8")
manifest = dict(re.findall(r'<item[^>]*id="([^"]+)"[^>]*href="([^"]+)"', opf))
manifest.update((i, h) for h, i in re.findall(r'<item[^>]*href="([^"]+)"[^>]*id="([^"]+)"', opf))
spine_ids = re.findall(r'<itemref[^>]*idref="([^"]+)"', opf)
spine_files = [manifest[i] for i in spine_ids if i in manifest]
print(f"[ok] spine : {spine_files}")

# ---------------------------------------------------------------- moteur de traduction
from argostranslate import settings as a_settings, translate as a_translate  # noqa: E402

a_settings.chunk_type = a_settings.ChunkType.ARGOSTRANSLATE
langs = a_translate.get_installed_languages()
src_lang = next(l for l in langs if l.code == FROM_CODE)
dst_lang = next(l for l in langs if l.code == TO_CODE)
translator = src_lang.get_translation(dst_lang)
print(f"[ok] moteur Argos Translate {FROM_CODE}->{TO_CODE} charge")

SENT_SPLIT = re.compile(r"(?<=[.!?…»\"')\]])\s+(?=[A-Z0-9\"'“«(\[])")


def chunk_text(text, limit=900):
    text = text.strip()
    if len(text) <= limit:
        return [text] if text else []
    parts = SENT_SPLIT.split(text)
    chunks, cur = [], ""
    for p in parts:
        if len(cur) + len(p) + 1 <= limit:
            cur = (cur + " " + p).strip()
        else:
            if cur:
                chunks.append(cur)
            cur = p
            while len(cur) > limit:
                chunks.append(cur[:limit])
                cur = cur[limit:]
    if cur:
        chunks.append(cur)
    return chunks


def translate_text(text):
    out = []
    for c in chunk_text(text):
        stats["chunks"] += 1
        try:
            out.append(translator.translate(c))
        except Exception as e:
            stats["failed_chunks"] += 1
            print(f"[warn] segment non traduit : {e}")
            out.append(c)
    return " ".join(out)


KEEP_SKIPPABLE = re.compile(r"^[\W_]*$")


def process_html(path):
    raw = path.read_text(encoding="utf-8")
    raw = apply_replacements(raw, REPLACEMENTS, "replacements")
    soup = BeautifulSoup(raw, "lxml")
    for node in soup.find_all(string=True):
        if not isinstance(node, NavigableString):
            continue
        if node.parent and node.parent.name in ("script", "style"):
            continue
        txt = node.strip()
        if len(txt) < 2 or KEEP_SKIPPABLE.match(txt) or not re.search(r"[A-Za-zÀ-ÿ]", txt):
            continue
        new = translate_text(txt)
        if new and new != txt:
            node.replace_with(new)
    for img in soup.find_all("img"):
        alt = img.get("alt", "").strip()
        if len(alt) >= 2 and re.search(r"[A-Za-z]", alt):
            img["alt"] = translate_text(alt)
    result = apply_replacements(str(soup), POST_REPLACEMENTS, "post_replacements")
    path.write_text(result, encoding="utf-8")
    print(f"[ok] traduit : {path.relative_to(SRC)}")


for rel in spine_files:
    p = SRC / "OEBPS" / rel
    if p.exists():
        process_html(p)
    else:
        print(f"[warn] fichier du spine introuvable : {rel}")

# ---------------------------------------------------------------- metadonnees + CSS sans-serif
opf = opf_path.read_text(encoding="utf-8")
opf = opf.replace(f'xml:lang="{FROM_CODE}"', f'xml:lang="{TO_CODE}"')
opf = re.sub(r"<dc:language>[^<]*</dc:language>", f"<dc:language>{TO_CODE}</dc:language>", opf)
opf = re.sub(r"<dc:title>([^<]*)</dc:title>", rf"<dc:title>\1 ({TO_CODE.upper()})</dc:title>", opf, count=1)
opf = apply_replacements(opf, REPLACEMENTS, "replacements")
opf_path.write_text(opf, encoding="utf-8")

css_path = SRC / "OEBPS" / "styles.css"
css = css_path.read_text(encoding="utf-8") if css_path.exists() else ""
css += "\n/* police sans-serif demandee par l'utilisateur */\n"
css += "html, body, p, div, span, h1, h2, h3, h4, h5, h6, li { font-family: sans-serif !important; }\n"
css_path.write_text(css, encoding="utf-8")

# ---------------------------------------------------------------- EPUB final
out_epub = OUTDIR / f"{BASE_NAME}.epub"
if out_epub.exists():
    out_epub.unlink()
with zipfile.ZipFile(out_epub, "w") as z:
    z.write(SRC / "mimetype", "mimetype", compress_type=zipfile.ZIP_STORED)
    for f in sorted(SRC.rglob("*")):
        if f.is_file() and f.name != "mimetype":
            z.write(f, f.relative_to(SRC).as_posix(), zipfile.ZIP_DEFLATED)
print(f"[ok] EPUB {TO_CODE.upper()} : {out_epub} ({out_epub.stat().st_size/1e6:.1f} Mo)")

# ---------------------------------------------------------------- PDF
parts = []
for rel in spine_files:
    p = SRC / "OEBPS" / rel
    if not p.exists():
        continue
    soup = BeautifulSoup(p.read_text(encoding="utf-8"), "lxml")
    body = soup.body
    inner = body.decode_contents() if body else str(soup)
    parts.append(f'<div class="chapter" style="page-break-before: always;">{inner}</div>')

book_html = f"""<!DOCTYPE html>
<html lang="{TO_CODE}"><head><meta charset="utf-8"><title>{BASE_NAME}</title>
<style>
  html, body {{ font-family: 'DejaVu Sans', 'Helvetica', sans-serif; }}
  body {{ font-size: 11pt; line-height: 1.55; margin: 0; }}
  .chapter {{ padding: 0 12mm; }}
  p {{ text-align: justify; margin: 0.45em 0; }}
  h1, h2, h3, h4 {{ font-family: 'DejaVu Sans', sans-serif; }}
  img {{ max-width: 100%; height: auto; display: block; margin: 0.5em auto; }}
</style></head><body>
{''.join(parts)}
</body></html>"""
book_html = re.sub(r'(src=")(?!OEBPS|/|https?:)', r"\1OEBPS/", book_html)
book_path = SRC / "book.html"
book_path.write_text(book_html, encoding="utf-8")

out_pdf = OUTDIR / f"{BASE_NAME}.pdf"


def pdf_wkhtmltopdf():
    subprocess.run(
        ["wkhtmltopdf", "--encoding", "utf-8", "--enable-local-file-access",
         "--page-size", "A4",
         "--margin-top", "18mm", "--margin-bottom", "18mm",
         "--margin-left", "20mm", "--margin-right", "20mm",
         str(book_path), str(out_pdf)],
        check=True, cwd=SRC,
    )


def pdf_weasyprint():
    from weasyprint import HTML
    HTML(str(book_path), base_url=str(SRC)).write_pdf(str(out_pdf))


def pdf_xhtml2pdf():
    from xhtml2pdf import pisa
    with open(str(out_pdf), "wb") as fh:
        pisa.CreatePDF(book_html, dest=fh, encoding="utf-8",
                       link_callback=lambda uri, rel: str(SRC / uri))


pdf_ok = False
for name, fn in [("wkhtmltopdf", pdf_wkhtmltopdf), ("weasyprint", pdf_weasyprint), ("xhtml2pdf", pdf_xhtml2pdf)]:
    try:
        fn()
        print(f"[ok] PDF {TO_CODE.upper()} via {name} : {out_pdf} ({out_pdf.stat().st_size/1e6:.1f} Mo)")
        pdf_ok = True
        break
    except Exception as e:
        print(f"[info] moteur PDF '{name}' indisponible ou en echec : {e}")
if not pdf_ok:
    print("[warn] aucun moteur PDF disponible (installez wkhtmltopdf, weasyprint ou xhtml2pdf)")

# ---------------------------------------------------------------- rapport
(OUTDIR / "rapport.txt").write_text(
    "Pipeline de traduction automatique (Argos Translate, local)\n"
    f"Source : {EPUB.name} (document fourni par l'utilisateur)\n"
    f"Paire : {FROM_CODE} -> {TO_CODE}\n"
    "Remplacements demandes :\n"
    "  Shirakawa -> Shiratama\n"
    "  Amatsuka Ten-ai -> Basori Tiara (+ Ten-ai -> Tiara, Amatsuka -> Basori)\n"
    "  Yakisoba -> Yakishio (forme capitalisee ; le plat 'yakisoba' est conserve)\n"
    "  Nuku-chan -> Nukkun\n"
    f"Remplacements avant traduction : {stats['replacements']}\n"
    f"Remplacements apres traduction : {stats['post_replacements']}\n"
    f"Segments traduits : {stats['chunks']} (echecs : {stats['failed_chunks']})\n"
    "Police : sans-serif (EPUB) / DejaVu Sans (PDF)\n",
    encoding="utf-8",
)
print(f"[ok] rapport ecrit : {OUTDIR / 'rapport.txt'}")
print(f"[resume] {stats}")
