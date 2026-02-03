# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projektziel

Kostengünstiger (< 2 Cent/Minute) Sprachassistent mit automatischer Spracherkennung und -ausgabe, der lokal und gehostet (Docker/Coolify) laufen kann.

## Architektur-Prinzipien

1. **Frontend ohne Backend-Server**: Die Frontend-Applikation muss lokal UND auf AWS S3 ohne Backend-Server funktionieren
2. **CORS-frei**: Alle API-Aufrufe müssen CORS-Probleme vermeiden
3. **Multi-Proxy-Architektur**: Drei Proxy-Server für verschiedene Funktionen
   - GLM 4.7 Proxy für KI-Chat (Haupt-AI)
   - JINA Proxy für tiefgehende Recherchen
   - Such-Proxy für Internetsuchen

## Technologie-Stack

### Frontend
- JavaScript mit Web Speech API (bevorzugt, aber 30-Sekunden-Limit beachten)
- Einfache, stabile Lösung statt komplexes Framework
- Muss auf Desktop (Linux) und mobilen Endgeräten funktionieren

### Backend (optional, nur wenn nötig für Docker-Hosting)
- Python mit virtueller Umgebung
- Whisper-Integration als Alternative zur Web Speech API
- Silero für Wake Word Detection (bereits aufgesetzt)

### Deployment
- Docker mit Coolify für gehostete Variante
- Lokale Ausführung auf Debian

## Bekannte Probleme aus der .plan-Datei

1. **Whisper auf Debian**: Fällt im Ruhezustand aus und benötigt System-Neustart
2. **Python Audio-Bibliotheken**: Probleme mit pydub/pyaudio und Hardware-Support auf Linux
3. **Web Speech API Limit**: 30 Sekunden Aufnahme-Limit zu kurz für lange Anfragen
4. **Barge-in Erkennung**: Sprachassistent muss erkennen, wenn User während der Auslage spricht

## Anforderungen an die Umsetzung

- Automatische Spracherkennung ohne Tastendruck (Push-to-Talk Start-Knopf wie Gemini)
- Antwort als Popup (Text) ODER Sprachnachricht
- Unterbrechung der Sprachausgabe möglich (Barge-in)
- Maximal ein Anbieter, nicht 10 verschiedene Dienste verknüpfen
- Einfache Architektur, keine unnötige Komplexität

## API-Proxy-Verwendung

Alle Proxys haben die API-Keys bereits serverseitig hinterlegt. Keine Keys im Frontend oder in GitHub-Repositories speichern!

## Sprachausgabe-Kompatibilität

- Kein Markdown in Bot-Antworten (**fett**, *kursiv*, `code`, etc.)
- Keine Unterstriche (_) oder Gleichheitszeichen (=) als Abgrenzung
- Deutsche Umlaute korrekt schreiben (ö, ä, ü, ß)
- Post-Processing-Pflicht für alle LLM-Antworten vor TTS-Ausgabe

## Entwicklungsumgebung

- Debian Linux
- Python3 (nicht python)
- Befehle immer mit Timeout 60000ms ausführen
- Vor Datei-Erstellung prüfen, ob Datei/Ordner bereits existiert
