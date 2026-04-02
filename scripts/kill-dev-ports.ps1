# Layihə dev portlarını boşaldır (köhnə uvicorn / vite prosesləri qalmasın).
$ErrorActionPreference = 'SilentlyContinue'
$ports = @(8002, 5173, 5174, 5175, 5176)

foreach ($port in $ports) {
  $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
  if (-not $conns) { continue }
  $procIds = $conns | Select-Object -ExpandProperty OwningProcess -Unique
  foreach ($procId in $procIds) {
    if ($procId -and $procId -gt 0) {
      Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    }
  }
}
