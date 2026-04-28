
#set text(lang: "de")
#set page(
  paper: "a4",
)

= Projektkonzept
// - Sinn und Zweck der Anwendung
//   - Für wen ist die Anwendung gedacht?
//   - Was soll mit der Anwendung gemacht werden?
//   - Welchen Vorteil haben Nutzende durch die Anwendung?

Die in diesem Projektkonzept beschriebene Anwendung soll eine einfache Anwendung zur Zeiterfassung für Werkstudenten sein. Für die Prorisierung der Entwicklung wird dabei in zwei Zielgruppen unterschieden. Die primäre Zielgruppe sind Studenten, die als Werkstudenten arbeiten und ihre Arbeitszeiten außerhalb eines von Arbeitgebern bereitgestellten Zeiterfassungssystem aufzeichnen wollen. Die erweiterte Zielgruppe sind selbständig Arbeitende, die ähnliche Bedürfnisse haben ihre Arbeitszeiten zu erfassen.

Für das Projekt wird sich in erster Linie auf die primäre Zielgruppe konzentriert und die erweiterte Zielgruppe wird in Betracht gezogen.

Nutzende haben durch die Anwendung die Möglichkeit nicht nur ihre Arbeitszeiten zu erfassen sondern auch Besitz von ihren Daten zu ergreifen und exportieren zu können ohne das sie in einem externen System in einer unzugänglichen Datenbank gespeichert sind.
Zudem müssen sie z.B. nicht dem Arbeitszeiterfassungssystem ihres Arbeitgebers vertrauen die Daten richtig zu speichern und haben somit eigene Nachweise für die geleistete Arbeitszeit.

Ziel des Projekts ist es nicht eine Anwendung zu entwickeln, die besonders viele Anwendungsbereiche abdeckt. Vielmehr soll die Anwendung wenige Funktionen unterstützen und diese qualitativ hochwertig umsetzen.

//TODO wie viele Personen kann man durch die Anwendung potenziell erreichen
//TODO Statistik über Bedürfniss nach Privatsphäre?
// - Zielpublikum
//   - Für welche Nutzerkreise ist die Anwendung gedacht?
//   - Wodurch zeichnen sich die Nutzerkreise aus?
//   - Was sind deren speziellen Bedürfnisse?

== Anforderungen
// - Anforderungen
//   - Erläutern Sie alle funktionalen und nicht-funktionalen Anforderungen (wie Sie es in Software-Engineering gelernt haben)
//   - Welche besonderen Anforderungen müssen für das Zielpublikum erfüllt werden.
//   - Welche Anforderungen an Performance, etc. müssen erfüllt werden
//   - Sonstige Anforderungen?
// - Die wesentlichen Use-Cases der Anwendung
//   - Erstellen Sie ein einfaches Use-Case-Diagramm (es müssen keine CRUD-Use-Cases mo-delliert werden)
//   - Beschreiben Sie die Use-Cases kurz und knapp, so dass der Inhalt nachvollziehbar ist.
=== Funktionale Anforderungen
- Arbeitszeiterfassung
  - Nutzende können ihre Arbeitszeiten aufzeichnen.
  - Nutzende können ihre Arbeitszeiten exportieren.
  - Nutzende können ihre Arbeitszeiten importieren.
  - Nutzende können ihre Arbeitszeiten löschen.
  - Nutzende können ihre Arbeitszeiten bearbeiten.
- Projekte
  - Nutzende können Projekte erstellen.
  - Nutzende können Projekte bearbeiten.
  - Nutzende können Projekte löschen.
  - Nutzende können Zeiten zu Projekten.
- Stopp-Start-Funktionalität
  - Nutzende müssen ihre Arbeitszeiten stoppen und starten können und die Arbeitszeit wird automatisch aufgezeichnet.
- Benachrichtigungen
  - Nutzende können  regelmäßige Benachrichtigungen aktivieren, um sich an das Eintragen der Arbeitszeigen zu erinnern.
- Die Anwendung soll in Deutsch und Englisch verfügbar sein.
- Rechtliches (Compliance)
  - Barrierefreiheit (Accessibility): Die Anwendung soll WCAG 2.2 AA-konform sein.
- WebAuthn/Sign-in
  - Nutzende müssen sich mit einem Passkey registrieren können.
  - Nutzende müssen sich über einen Passkey authentifizieren können.
  - Nutzende können weitere Passkeys hinzufügen.
  - Nutzende können Passkeys löschen.
  - Hinzufügen, Editieren von Recovery-Email



=== Nicht-Funktionale Anforderungen
- Benutzerfreundlichkeit (Usability)
  - Die Anwendung soll intuitiv und einfach zu bedienen sein. Dies bedeutet unter anderem, dass die Anwenung eine verständliche visuelle Hierarchie in der Benutzeroberfläche bietet und funktionale Anforderung mit minimalem Aufwand von Nutzenden erfüllt werden kann.
- Sicherheit (Security)
  - Daten werden verschlüsselt zwischen Client und Server gesendet.
  - Daten von Nutzenden sind sicher vor unauthorisierten Zugriffen geschützt.
- Barrierefreiheit (Accessibility)
  - Dies ist sowohl ein funktionales als auch eine nicht-funktionale Anforderung. Funktional: Compliance. Nicht-Funktional: "Accessibility beyond WCAG"
  - In der funktionalen Anforderung soll die Anwendung den Rechtlichen Anforderungen entsprechen.
- Fokus
  - Die Anwendung soll sich auf die primären Ziele konzentrieren und diese qualitativ hochwertig umsetzen anstatt möglichst viele Funktionen anzubieten.
- Plattformunabhängigkeit
  - Die Anwendung soll auf verschiedenen Plattformen lauffähig sein. Dazu gehören Windows, macOS, Linux, iOS und Android.
- Die Serverseitigen Komponenten der Anwendung sollen weitestgehend horizontal skalierbar sein. Auch wenn sie im Zuge des Projektes nicht horizontal skaliert werden.
- Zuverlässigkeit (Reliability)
  - Die Anwendung wird ausreichend für Demozwecke bereitgestellt und soll in diesem Umfang verfügbar, leistungsfähig genug sowie zuverlässig sein.

// - Klassendiagramm mit den Entitäten
//   - Erstellen Sie ein Klassendiagramm, in dem Sie die geplanten Entitäten mit ihren Beziehungen darstellen.
//   - Erläutern Sie kurz die Entitäten sowie deren Beziehungen zueinander.

=== Anforderungen außerhalb des Projektziels (Non-Goals)
Die Anwendung ist nicht für die Zeiterfassung von Organisationen gedacht sofern sie aus mehr als einem Arbeitnehmer bestehen. Es soll keine Verwaltung von Nutzenden für Organisationen geben.
Die Anwendung wird während des Projektes für Demozwecke bereit gestellt. Jedoch wird sie aus Kostengründen nicht in einer Form bereitgestellt, dass sie besonders hohen Andrang oder Leistungsfähigkeit oder Zuverlässigkeit bietet. Bereitstellung einer Produktionsumgebung ist außerhalb des Projektziels. Persistenz der Daten über lange Zeiträume ist ebenfalls nicht garantiert.

=== Erweiterungen
Die Anwendung soll in Zukunft erweiterbar sein um Nutzenden in Zukunft ermöglichen, ihre Arbeitszeiten Projekten zuzuordnen. Dies ist jedoch nicht das primäre Ziel der Anwendung und wird gegebenenfalls in einem späteren Projekt ergänzt.

== Anwendungsfälle (Use-Cases)
#figure(
  image("Use Case Diagram Time.svg", width: 80%),
  caption: [Time Tracking Use Case Diagram],
)


== Entitäten
- User
- Time Entry
- WebAuthn User //TODO explain why separate from user
- WebAuthn Credential
- WebAuthn Authenticator
- Timer
- Project
// - Sessions
// - Reset links
// - WebPush Subscription?

== Software-Architektur
Durch die Anforderungen des Moduls an dieses Projekt soll für diese Software zwei Komponenten entwickelt werden, die in einer zentralisierten Server-Client-Architektur arrangiert sind.
Die erste Komponente ist eine HTTP JSON API, die den REST-Prinzipien folgt. Für die Endpunkte zur Authentifizierung, Autorisierung und Hosting des Clients wird von diesen Prinzipien eventuell abgewichen werden müssen, da der API-Server auch die Rolle des Authentifizierungs-Servers erfüllt.

Über die von der API bereitgestellten Endpunkte wird einer Client-Server-Architektur realisiert. Der Client ist eine Web-Anwendung, die die API-Endpunkte aufruft und die Daten aus der API abruft. Die API-Endpunkte werden von einem Server ausgeführt, der die Daten speichert und verarbeitet.
Zum speichern der Daten kommt eine Datenbank wie eventuell PostgreSQL oder SQLite zum Einsatz.
SQLite würde sich anbieten, da dies das Deployment der Anwendung erleichtert, da SQLite nur eine persistente Datei im Dateisystem erfordert. Dahingegen benötigt PostgreSQL eine eigene Datenbankserverinstanz.
Zusätzllich wird für Authentifizierung über WebAuthn ein temporärer Speicher für Challenges benötigt, der mit einem Redis-Service umgesetzt werden kann. Um das Deployment der Anwendung simpel zu halten wird eventuell auf eine eigene Redis-Instanz verzichtet und stattdessen in der Server-Anwendung eine Tabelle zum speichern der temporären Challenges eingebaut. Diese benötigt zudem einen regelmäßigen Background-Job um abgelaufene Challenges zu löschen damit die Tabelle nicht ohne Limitierungen zu groß wird. Ein weiterer Nachteil ist auch, dass die Zugriffszeiten auf diese Tabelle eventuell geringer sein werden als die Zugriffszeiten auf eine Redis-Instanz. Jedoch ist dies für das erste in diesem Projekt verkraftbar solange sie nur für Demonstrationszwecke verwendet wird und es das Deployment der Anwendung erleichtert.

Damit Nutzende die Anwendung nutzen können wird eine Single-Page-Application (SPA) implementiert. Diese greift über die von der API bereitgestellten Endpunkte auf die Daten zu und bietet eine Schnittstelle mit der Nutzende mit der Anwendung interagieren können.
Die Anwendung kann über moderne Webbrowser geöffnen und genutzt werden umd die Anforderung an die Verfügbarkeit auf verschiedenen Plattformen zu erfüllen.
Das Hosting der der SPA wird dabei auch von der API übernommen, da dies die eine Cookie-basierte Aithentifizierung erleichtert und Cross Origin Resource Sharing (CORS) vermeidet, da die SPA sowie die API auf der gleichen Domain erreichbar sind.


// - Beschreibung der Software-Architektur
//   - Welche Komponenten wollen Sie verwenden? Warum wählen sie diese aus?
//   - Zeichnen Sie eine grobe Darstellung der Software-Architektur mit allen relevanten Schnittstellen.
// TODO Temporal API
