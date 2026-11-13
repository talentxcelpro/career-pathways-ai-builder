Add-Type -AssemblyName System.Drawing
$imgPath = "C:\Users\Arshid.Wani\.gemini\antigravity\brain\73cc950f-c768-4dfe-9c0f-46924a891b41\.user_uploaded\media_1794562912436_e009e77b.png"
$img = [System.Drawing.Bitmap]::FromFile($imgPath)

# In 1024 x 576:
# The professionals circle visual is at x=30 to x=325, y=115 to y=280
$cropX = 30
$cropY = 115
$cropW = 295
$cropH = 165

$rect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
$cropped = $img.Clone($rect, $img.PixelFormat)
$outPath = "c:\Users\Arshid.Wani\talentxcel-local\public\career-pathfinder-professionals.png"
$cropped.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)

$cropped.Dispose()
$img.Dispose()
Write-Host "Updated crop: $cropW x $cropH"
