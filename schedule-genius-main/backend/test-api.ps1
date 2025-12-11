# Script de test pour l'API Backend
# Utilise Invoke-WebRequest (PowerShell) pour tester les endpoints

$baseUrl = "http://localhost:3001"
$token = "admin"  # Token pour l'authentification

Write-Host "🧪 Test de l'API Backend" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "1. Test Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/health" -Method GET
    Write-Host "✅ Health Check: OK" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
    Write-Host "   Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Health Check: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Get Modules (nécessite auth)
Write-Host "2. Test GET /api/modules..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    $response = Invoke-WebRequest -Uri "$baseUrl/api/modules" -Method GET -Headers $headers
    Write-Host "✅ GET Modules: OK" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
    $content = $response.Content | ConvertFrom-Json
    Write-Host "   Modules count: $($content.Count)" -ForegroundColor Gray
} catch {
    Write-Host "❌ GET Modules: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Response: $responseBody" -ForegroundColor Red
    }
}
Write-Host ""

# Test 3: Get Programs
Write-Host "3. Test GET /api/programs..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    $response = Invoke-WebRequest -Uri "$baseUrl/api/programs" -Method GET -Headers $headers
    Write-Host "✅ GET Programs: OK" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
    $content = $response.Content | ConvertFrom-Json
    Write-Host "   Programs count: $($content.Count)" -ForegroundColor Gray
} catch {
    Write-Host "❌ GET Programs: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: Create Module (nécessite admin)
Write-Host "4. Test POST /api/modules..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    $body = @{
        name = "Test Module"
        code = "TEST001"
        type = "CM"
        nature = "informatique"
        hours_cm = 20
        hours_td = 10
        hours_tp = 0
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$baseUrl/api/modules" -Method POST -Headers $headers -Body $body
    Write-Host "✅ POST Module: OK" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
    $content = $response.Content | ConvertFrom-Json
    Write-Host "   Created Module ID: $($content.id)" -ForegroundColor Gray
} catch {
    Write-Host "❌ POST Module: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "✅ Tests terminés!" -ForegroundColor Cyan

