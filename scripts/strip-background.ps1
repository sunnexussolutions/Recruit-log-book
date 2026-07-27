Add-Type -AssemblyName System.Drawing

$srcPath = "D:\XboxGames\Recruit log book\assets\sun-nexus-logo.png"
if (-not (Test-Path $srcPath)) {
    Write-Error "Source logo not found at $srcPath"
    exit 1
}

$bmp = [System.Drawing.Image]::FromFile($srcPath)
$width = $bmp.Width
$height = $bmp.Height

Write-Host "Inspecting logo image dimensions: $($width)x$($height)"

# Create a transparent 32-bit ARGB bitmap copy
$newBmp = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($newBmp)
$g.Clear([System.Drawing.Color]::Transparent)

# Lock bits for fast pixel processing
$rect = New-Object System.Drawing.Rectangle(0, 0, $width, $height)
$bmpData = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$newBmpData = $newBmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

$bytesCount = [Math]::Abs($bmpData.Stride) * $height
$rgbValues = New-Object byte[] $bytesCount
$newRgbValues = New-Object byte[] $bytesCount

[System.Runtime.InteropServices.Marshal]::Copy($bmpData.Scan0, $rgbValues, 0, $bytesCount)

for ($i = 0; $i -lt $bytesCount; $i += 4) {
    $b = $rgbValues[$i]
    $gVal = $rgbValues[$i + 1]
    $r = $rgbValues[$i + 2]
    $a = $rgbValues[$i + 3]

    # If pixel is white or near white (background canvas), set alpha to 0
    if ($r -gt 232 -and $gVal -gt 232 -and $b -gt 232) {
        $newRgbValues[$i] = 0     # B
        $newRgbValues[$i + 1] = 0 # G
        $newRgbValues[$i + 2] = 0 # R
        $newRgbValues[$i + 3] = 0 # Alpha = 0 (Transparent)
    } else {
        $newRgbValues[$i] = $b
        $newRgbValues[$i + 1] = $gVal
        $newRgbValues[$i + 2] = $r
        $newRgbValues[$i + 3] = $a
    }
}

[System.Runtime.InteropServices.Marshal]::Copy($newRgbValues, 0, $newBmpData.Scan0, $bytesCount)

$bmp.UnlockBits($bmpData)
$newBmp.UnlockBits($newBmpData)
$bmp.Dispose()
$g.Dispose()

$tempPath = "D:\XboxGames\Recruit log book\assets\sun-nexus-logo-clean.png"
$newBmp.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Png)
$newBmp.Dispose()

Remove-Item $srcPath -Force
Move-Item $tempPath $srcPath -Force

Write-Host "✅ White background pixels successfully stripped! Transparent PNG saved to $srcPath"
