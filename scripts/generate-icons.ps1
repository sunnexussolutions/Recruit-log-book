Add-Type -AssemblyName System.Drawing

$srcPath = "D:\XboxGames\Recruit log book\assets\sun-nexus-logo.png"
if (-not (Test-Path $srcPath)) { 
    Write-Error "Source logo not found at $srcPath"
    exit 1 
}

$srcImg = [System.Drawing.Image]::FromFile($srcPath)

function New-PaddedIcon {
    param(
        [string]$outputPath,
        [int]$canvasWidth,
        [int]$canvasHeight,
        [int]$logoWidth,
        [int]$logoHeight,
        [bool]$isTransparent = $false
    )

    $bmp = New-Object System.Drawing.Bitmap($canvasWidth, $canvasHeight)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    if ($isTransparent) {
        $g.Clear([System.Drawing.Color]::Transparent)
    } else {
        $g.Clear([System.Drawing.Color]::White)
    }

    $posX = [int](($canvasWidth - $logoWidth) / 2)
    $posY = [int](($canvasHeight - $logoHeight) / 2)

    $g.DrawImage($srcImg, $posX, $posY, $logoWidth, $logoHeight)

    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

$resDir = "D:\XboxGames\Recruit log book\android\app\src\main\res"

# Densities and dimensions for Android launcher icons & adaptive foregrounds
$densities = @(
    @{ Name="mipmap-mdpi";    Legacy=48;  LegacyLogo=44;  Fg=108; FgLogo=88  },
    @{ Name="mipmap-hdpi";    Legacy=72;  LegacyLogo=66;  Fg=162; FgLogo=132 },
    @{ Name="mipmap-xhdpi";   Legacy=96;  LegacyLogo=88;  Fg=216; FgLogo=176 },
    @{ Name="mipmap-xxhdpi";  Legacy=144; LegacyLogo=132; Fg=432; FgLogo=354 },
    @{ Name="mipmap-xxxhdpi"; Legacy=192; LegacyLogo=176; Fg=576; FgLogo=472 }
)

foreach ($d in $densities) {
    $dirPath = Join-Path $resDir $d.Name
    if (Test-Path $dirPath) {
        # Legacy launcher icon (white background, padded logo)
        New-PaddedIcon -outputPath (Join-Path $dirPath "ic_launcher.png") -canvasWidth $d.Legacy -canvasHeight $d.Legacy -logoWidth $d.LegacyLogo -logoHeight $d.LegacyLogo -isTransparent $false
        New-PaddedIcon -outputPath (Join-Path $dirPath "ic_launcher_round.png") -canvasWidth $d.Legacy -canvasHeight $d.Legacy -logoWidth $d.LegacyLogo -logoHeight $d.LegacyLogo -isTransparent $false
        
        # Adaptive foreground (transparent background, safe-zone padded logo)
        New-PaddedIcon -outputPath (Join-Path $dirPath "ic_launcher_foreground.png") -canvasWidth $d.Fg -canvasHeight $d.Fg -logoWidth $d.FgLogo -logoHeight $d.FgLogo -isTransparent $true
        
        Write-Host "Processed $($d.Name)"
    }
}

$srcImg.Dispose()
Write-Host "✅ Perfectly formatted Android adaptive launcher icons generated!"
