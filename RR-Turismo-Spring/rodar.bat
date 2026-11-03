@echo off
rem ============================================================
rem  RODAR O SPRING (compila com Java 21 e inicia o servidor)
rem  Use ESTE arquivo (duplo clique) em vez do botao Run do VS Code.
rem  Mac/Linux: use o rodar.sh
rem  Precisa de: pasta "lib" ao lado deste arquivo e um JDK 21+.
rem ============================================================
cd /d "%~dp0"
if not exist lib (
  echo ERRO: a pasta "lib" nao esta aqui. Copie a pasta lib para dentro desta pasta.
  pause
  exit /b 1
)
if exist bin rmdir /s /q bin
mkdir bin
powershell -NoProfile -Command "Get-ChildItem -Recurse -Filter *.java src | ForEach-Object { $_.FullName.Replace('\','/') } | Set-Content -Encoding ascii fontes.txt"
set PROC=
javac --help 2>&1 | findstr /C:"proc:full" >nul && set PROC=-proc:full
javac --release 21 -encoding UTF-8 -parameters %PROC% -cp "lib/*" -d bin @fontes.txt
if errorlevel 1 (
  echo.
  echo ERRO ao compilar. Veja as mensagens acima.
  pause
  exit /b 1
)
echo.
echo Compilado! Iniciando o servidor (procure: Tomcat started on port 9000)...
java -cp "bin;src;lib/*" com.projeto.Principal
pause
