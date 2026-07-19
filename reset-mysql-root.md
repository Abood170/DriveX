# Reset MySQL80 root password (run in an elevated PowerShell)

1. Stop the service:
   ```
   net stop MySQL80
   ```

2. Create the init file with the new password (blank, to match server.js's dbConfig):
   ```
   Set-Content -Path "C:\mysql-init.txt" -Value "ALTER USER 'root'@'localhost' IDENTIFIED BY '';" -Encoding ascii
   ```

3. Start mysqld manually with that init file (it will print startup logs and keep running in the foreground):
   ```
   & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --defaults-file="C:\ProgramData\MySQL\MySQL Server 8.0\my.ini" --init-file="C:\mysql-init.txt" --console
   ```
   Wait until you see a line like `[Server] X Plugin ready for connections` or `ready for connections`, then press `Ctrl+C` to stop it.

4. Delete the init file (it contains a password-reset command, no need to keep it):
   ```
   Remove-Item "C:\mysql-init.txt"
   ```

5. Restart the service normally:
   ```
   net start MySQL80
   ```

Once done, tell me and I'll retest the app's DB connection.
