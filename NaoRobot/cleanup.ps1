# Cleanup Script for Nao Robot App
echo "Cleaning up hanging Nao OS processes..."

# Kill Python (Flask)
$flaskProc = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($flaskProc) {
    foreach ($p in $flaskProc) {
        if ($p.OwningProcess -gt 0) {
            echo "Killing Flask PID: $($p.OwningProcess)"
            Stop-Process -Id $p.OwningProcess -Force -ErrorAction SilentlyContinue
        }
    }
}

# Kill Vite (Node)
$vitePorts = 5173..5185
foreach ($port in $vitePorts) {
    $viteProc = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($viteProc) {
        foreach ($p in $viteProc) {
            if ($p.OwningProcess -gt 0) {
                echo "Killing Vite PID: $($p.OwningProcess) on Port: $port"
                Stop-Process -Id $p.OwningProcess -Force -ErrorAction SilentlyContinue
            }
        }
    }
}

echo "Cleanup Complete. System Ready for Fresh Initialization."
