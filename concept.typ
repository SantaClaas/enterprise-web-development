
#set text(lang: "de")
#set page(
  paper: "a4",
)

= Projektkonzept
// - Sinn und Zweck der Anwendung
//   - Für wen ist die Anwendung gedacht?
//   - Was soll mit der Anwendung gemacht werden?
//   - Welchen Vorteil haben Nutzende durch die Anwendung?

== Sinn und Zweck der Anwendung
Die in diesem Projektkonzept beschriebene Anwendung soll eine einfache Anwendung zur Zeiterfassung für Werkstudenten sein. Für die Prorisierung der Entwicklung wird dabei in zwei Zielgruppen unterschieden. Die primäre Zielgruppe sind Studenten, die als Werkstudenten arbeiten und ihre Arbeitszeiten außerhalb eines von Arbeitgebern bereitgestellten Zeiterfassungssystem aufzeichnen wollen. Die erweiterte Zielgruppe sind selbständig Arbeitende, die ähnliche Bedürfnisse haben ihre Arbeitszeiten zu erfassen.

Für das Projekt wird sich in erster Linie auf die primäre Zielgruppe konzentriert und die erweiterte Zielgruppe wird in Betracht gezogen.

Nutzende haben durch die Anwendung die Möglichkeit nicht nur ihre Arbeitszeiten zu erfassen sondern auch Besitz von ihren Daten zu ergreifen und exportieren zu können ohne das sie in einem externen System in einer unzugänglichen Datenbank gespeichert sind.
Zudem müssen sie z.B. nicht dem Arbeitszeiterfassungssystem ihres Arbeitgebers vertrauen die Daten richtig zu speichern und haben somit eigene Nachweise für die geleistete Arbeitszeit.

== Zielpublikum
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
  - Nutzende müssen ihre Arbeitszeiten aufzeichnen können
  - Nutzende müssen ihre Arbeitszeiten exportieren können
  - Nutzende müssen ihre Arbeitszeiten importieren können
  - Nutzende müssen ihre Arbeitszeiten löschen können
  - Nutzende müssen ihre Arbeitszeiten bearbeiten können
- Sign-in
  - Nutzende müssen sich authentifizieren können um auf ihre Daten zuzugreifen
  -

=== Nicht-Funktionale Anforderungen
- Benutzerfreundlichkeit (Usability)
  - Die Anwendung soll intuitiv und einfach zu bedienen sein. Dies bedeutet unter anderem, dass die Anwenung eine verständliche visuelle Hierarchie in der Benutzeroberfläche bietet und funktionale Anforderung mit minimalem Aufwand von Nutzenden erfüllt werden kann.
- Sicherheit (Security)
  - Daten werden verschlüsselt zwischen Client und Server gesendet.
  - Daten von Nutzenden sind sicher vor unauthorisierten Zugriffen geschützt.
- Barrierefreiheit (Accessibility)
  - Dies ist sowohl ein funktionales als auch eine nicht-funktionale Anforderung.
  - In der funktionalen Anforderung
// - Klassendiagramm mit den Entitäten
//   - Erstellen Sie ein Klassendiagramm, in dem Sie die geplanten Entitäten mit ihren Bezie-hungen darstellen.
//   - Erläutern Sie kurz die Entitäten sowie deren Beziehungen zueinander.
== Entitäten
- User
- Time Entry
- WebAuthn User //TODO explain why separate from user
- WebAuthn Credential
- Sessions
- Reset links
// - WebPush Subscription?


// - Beschreibung der Software-Architektur
//   - Welche Komponenten wollen Sie verwenden? Warum wählen sie diese aus?
//   - Zeichnen Sie eine grobe Darstellung der Software-Architektur mit allen relevanten Schnittstellen.
// TODO Temporal API
