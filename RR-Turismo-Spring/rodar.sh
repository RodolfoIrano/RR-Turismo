#!/usr/bin/env bash
# ============================================================
#  RODAR O SPRING no Mac / Linux  (no Windows use o rodar.bat)
#  Precisa de: JDK 17 ou superior e MySQL ligado.
#  Uso:  chmod +x rodar.sh && ./rodar.sh
# ============================================================
cd "$(dirname "$0")" || exit 1
JAVAC=javac; JAVA=java
[ -x jdk/bin/javac ] && { JAVAC=jdk/bin/javac; JAVA=jdk/bin/java; }   # JDK local (pasta "jdk"), se existir
[ -d lib ] || { echo "ERRO: a pasta lib nao esta aqui."; exit 1; }
rm -rf bin && mkdir bin
find src -name "*.java" > fontes.txt
PROC=""
$JAVAC --help 2>&1 | grep -q "proc:full" && PROC="-proc:full"   # JDK 23+ precisa ligar o Lombok
$JAVAC --release 17 -encoding UTF-8 -parameters $PROC -cp "lib/*" -d bin @fontes.txt || { echo "ERRO ao compilar. Se disser release 17 not supported, instale o JDK 21 (adoptium.net)."; exit 1; }
echo "Compilado! Iniciando (procure: Tomcat started on port 9000)..."
$JAVA -cp "bin:src:lib/*" com.projeto.Principal
