$ErrorActionPreference = "Stop"

function Test-Jdk17($Home) {
    if ([string]::IsNullOrWhiteSpace($Home)) { return $false }

    $java = Join-Path $Home "bin\java.exe"
    $javac = Join-Path $Home "bin\javac.exe"
    if (!(Test-Path $java) -or !(Test-Path $javac)) { return $false }

    $versionOutput = & $java -version 2>&1 | Out-String
    return $versionOutput -match 'version "17\.' -or $versionOutput -match 'version "17"'
}

function Find-Jdk17 {
    if (Test-Jdk17 $env:JAVA_HOME) {
        return $env:JAVA_HOME
    }

    $roots = @(
        "C:\Program Files\Eclipse Adoptium",
        "C:\Program Files\Microsoft",
        "C:\Program Files\Java",
        "C:\Program Files\BellSoft",
        "C:\Program Files\Zulu",
        "C:\Program Files\Amazon Corretto"
    )

    foreach ($root in $roots) {
        if (!(Test-Path $root)) { continue }

        $candidate = Get-ChildItem $root -Directory -ErrorAction SilentlyContinue |
            Where-Object { $_.Name -match '17' } |
            Sort-Object FullName -Descending |
            Where-Object { Test-Jdk17 $_.FullName } |
            Select-Object -First 1

        if ($candidate) {
            return $candidate.FullName
        }
    }

    return $null
}

$jdk = Find-Jdk17
if (!$jdk) {
    Write-Host "JDK 17 introuvable." -ForegroundColor Red
    Write-Host "Installe-le avec :" -ForegroundColor Yellow
    Write-Host "  winget install EclipseAdoptium.Temurin.17.JDK" -ForegroundColor Yellow
    Write-Host "Puis relance :" -ForegroundColor Yellow
    Write-Host "  .\build-java17.bat" -ForegroundColor Yellow
    exit 1
}

$env:JAVA_HOME = $jdk
$env:Path = "$env:JAVA_HOME\bin;$env:Path"

Write-Host "JAVA_HOME = $env:JAVA_HOME" -ForegroundColor Green
& "$env:JAVA_HOME\bin\java.exe" -version

# Évite de réutiliser un daemon Gradle lancé avec Java 8.
& "$PSScriptRoot\gradlew.bat" --stop | Out-Null

& "$PSScriptRoot\gradlew.bat" build @Args
exit $LASTEXITCODE
