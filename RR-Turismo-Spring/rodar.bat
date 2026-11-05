@echo off
rem ============================================================
rem  RODAR O SPRING (compila e inicia o servidor)
rem  Use ESTE arquivo (duplo clique) em vez do botao Run do VS Code.
rem  Mac/Linux: use o rodar.sh
rem  Precisa de: pasta "lib" ao lado deste arquivo e um JDK 17 ou superior.
rem  Sem JDK instalado? Coloque um JDK dentro da pasta "jdk" (ao lado deste
rem  arquivo) e ele sera usado automaticamente - veja o README.
rem ============================================================
cd /d "%~dp0"
if not exist lib (
  echo ERRO: a pasta "lib" nao esta aqui. Copie a pasta lib para dentro desta pasta.
  pause
  exit /b 1
)

set "JAVAC=javac"
set "JAVA=java"
if exist "jdk\bin\javac.exe" set "JAVAC=jdk\bin\javac.exe"
if exist "jdk\bin\java.exe" set "JAVA=jdk\bin\java.exe"
echo Usando o compilador:
"%JAVAC%" -version

if exist bin rmdir /s /q bin
mkdir bin
powershell -NoProfile -Command "Get-ChildItem -Recurse -Filter *.java src | ForEach-Object { $_.FullName.Replace('\','/') } | Set-Content -Encoding ascii fontes.txt"
set PROC=
"%JAVAC%" --help 2>&1 | findstr /C:"proc:full" >nul && set PROC=-proc:full
"%JAVAC%" --release 17 -encoding UTF-8 -parameters %PROC% -cp "lib/*" -d bin @fontes.txt
if errorlevel 1 (
  echo.
  echo ERRO ao compilar. Veja as mensagens acima.
  echo Se aparecer "release version 17 not supported", seu Java e antigo ^(menor que 17^).
  echo Solucao: instale o JDK 21 ou coloque um JDK 21 na pasta "jdk" ^(veja o README^).
  pause
  exit /b 1
)
echo.
echo Compilado! Iniciando o servidor (procure: Tomcat started on port 9000)...
"%JAVA%" -cp "bin;src;lib/*" com.projeto.Principal
pause
