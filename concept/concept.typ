#set page(numbering: none)
// Fix fonts being set to times new roman in SVGs. This is not ideal as I want different fonts for different SVGs but it is better
#show image: set text(font: "Arial")


#align(center)[
  #par(leading: 1em)[#text(10pt)[#for _ in range(3) { linebreak() }]]

  #par[
    #text(30pt)[Time Track]
    #text(10pt)[#for _ in range(2) { linebreak() }]
    #text(18pt)[Projektkonzept]
    #text(10pt)[#for _ in range(2) { linebreak() }]
    #text(18pt)[Enterprise Web Development]
  ]

  #text(10pt)[#for _ in range(2) { linebreak() }]
]

#place(
  bottom + left,
)[
  Claas Möhlmann\
  113366\
  tgtp6192\@bht-berlin.de
]

#set text(lang: "de")
#set page(
  paper: "a4",
  numbering: "1",
)
#counter(page).update(1)

#outline()

#pagebreak()

= Projektkonzept
// - Sinn und Zweck der Anwendung
//   - Für wen ist die Anwendung gedacht?
//   - Was soll mit der Anwendung gemacht werden?
//   - Welchen Vorteil haben Nutzende durch die Anwendung?

Die in diesem Projektkonzept beschriebene Anwendung soll eine einfache Anwendung zur Zeiterfassung für Werkstudenten sein. Für die Priorisierung der Entwicklung wird dabei in zwei Zielgruppen unterschieden. Die primäre Zielgruppe ist Studenten, die als Werkstudenten arbeiten und ihre Arbeitszeiten außerhalb eines von Arbeitgebern bereitgestellten Zeiterfassungssystem aufzeichnen wollen. Die erweiterte Zielgruppe sind selbständig Arbeitende, die ähnliche Bedürfnisse haben ihre Arbeitszeiten zu erfassen.


Für das Projekt wird sich in erster Linie auf die primäre Zielgruppe konzentriert und die erweiterte Zielgruppe wird in Betracht gezogen.

Nutzende haben durch die Anwendung die Möglichkeit nicht nur ihre Arbeitszeiten zu erfassen sondern auch Besitz von ihren Daten zu ergreifen und exportieren zu können ohne, dass sie in einem externen System in einer unzugänglichen Datenbank gespeichert sind.
Zudem müssen sie z.B. nicht dem Arbeitszeiterfassungssystem ihres Arbeitgebers vertrauen die Daten richtig zu speichern und haben somit eigene Nachweise für die geleistete Arbeitszeit.

Ziel des Projekts ist es nicht eine Anwendung zu entwickeln, die besonders viele Anwendungsbereiche abdeckt. Der Fokus liegt auf einer hohen funktionalen Dichte und Usability innerhalb eines reduzierten Feature-Sets (KISS-Prinzip - Keep It Simple, Stupid).

//TODO wie viele Personen kann man durch die Anwendung potenziell erreichen
//TODO Statistik über Bedürfniss nach Privatsphäre?
// - Zielpublikum
//   - Für welche Nutzerkreise ist die Anwendung gedacht?
//   - Wodurch zeichnen sich die Nutzerkreise aus?
//   - Was sind deren speziellen Bedürfnisse?

= Anforderungen
// - Anforderungen
//   - Erläutern Sie alle funktionalen und nicht-funktionalen Anforderungen (wie Sie es in Software-Engineering gelernt haben)
//   - Welche besonderen Anforderungen müssen für das Zielpublikum erfüllt werden.
//   - Welche Anforderungen an Performance, etc. müssen erfüllt werden
//   - Sonstige Anforderungen?
// - Die wesentlichen Use-Cases der Anwendung
//   - Erstellen Sie ein einfaches Use-Case-Diagramm (es müssen keine CRUD-Use-Cases mo-delliert werden)
//   - Beschreiben Sie die Use-Cases kurz und knapp, so dass der Inhalt nachvollziehbar ist.
Im folgenden werden die funktionalen und nicht-funktionalen Anforderungen aufgeführt. Die wesentlichen Use-Cases der Anwendung werden im Kapitel Use-Cases erläutert.
Manche Anforderungen finden sich in beiden Kategorien wie Accessibility, da dieses zum einen als Compliance festgelegten Kriterien entsprechen muss und zum anderen aber auch nicht-funktional die Zugänglichkeit der Anwendung verbessert.

== Funktionale Anforderungen
+ Arbeitszeiterfassung
  + Nutzende können ihre Arbeitszeiten aufzeichnen.
  + Nutzende können ihre Arbeitszeiten exportieren.
  + Nutzende können ihre Arbeitszeiten importieren.
  + Nutzende können ihre Arbeitszeiten löschen.
  + Nutzende können ihre Arbeitszeiten bearbeiten.
+ Projekte
  + Nutzende können Projekte erstellen.
  + Nutzende können Projekte bearbeiten.
  + Nutzende können Projekte löschen.
  + Nutzende können Zeiten zu Projekten.
+ Organisationen
  + Nutzende können Organisationen erstellen.
  + Nutzende können Organisationen bearbeiten.
  + Nutzende können Organisationen löschen.
  + Nutzende können Projekte zu Organisationen zuordnen.
  + Nutzende können Zeiten zu Organisationen über Projekte zuordnen.
  + Nutzende können Nutzende zu Organisationen einladen.
  + Nutzende können Nutzende aus Organisationen entfernen.
  + Nutzende können Nutzende für Organisationen anlegen.
+ Stopp-Start-Funktionalität
  + Nutzende müssen ihre Arbeitszeiten stoppen und starten können und die Arbeitszeit wird automatisch aufgezeichnet.
+ Benachrichtigungen
  + Nutzende können  regelmäßige Benachrichtigungen aktivieren, um sich an das Eintragen der Arbeitszeigen zu erinnern.
+ Die Anwendung soll in Deutsch und Englisch verfügbar sein.
+ Rechtliches (Compliance)
  + Barrierefreiheit (Accessibility): Die Anwendung soll WCAG 2.2 AA-konform sein. @w3c_wcag22
+ WebAuthn/Sign-in
  + Nutzende müssen sich mit einem Passkey registrieren können.
  + Nutzende müssen sich über einen Passkey authentifizieren können.
  + Nutzende können weitere Passkeys hinzufügen.
  + Nutzende können Passkeys löschen.
  + Hinzufügen, Editieren von Recovery-Email


== Nicht-Funktionale Anforderungen
+ Benutzerfreundlichkeit (Usability)
  + Die Anwendung soll intuitiv und einfach zu bedienen sein. Dies bedeutet unter anderem, dass die Anwenung eine verständliche visuelle Hierarchie in der Benutzeroberfläche bietet und funktionale Anforderung mit minimalem Aufwand von Nutzenden erfüllt werden kann.
  + Die Eingabe von Zeiten sollte mit möglichst wengig Tastatur-Eingaben erfolgen.
+ Sicherheit (Security)
  + Daten werden verschlüsselt zwischen Client und Server gesendet.
  + Daten von Nutzenden sind sicher vor unauthorisierten Zugriffen geschützt.
+ Barrierefreiheit (Accessibility)
  + Dies ist sowohl ein funktionales als auch eine nicht-funktionale Anforderung. Funktional: Compliance. Nicht-Funktional: "Accessibility beyond WCAG"
  + In der funktionalen Anforderung soll die Anwendung den Rechtlichen Anforderungen entsprechen.
+ Fokus
  + Die Anwendung soll sich auf die primären Ziele konzentrieren und diese qualitativ hochwertig umsetzen, anstatt möglichst viele Funktionen anzubieten.
+ Plattformunabhängigkeit
  + Die Anwendung soll auf verschiedenen Plattformen lauffähig sein. Dazu gehören Windows, macOS, Linux, iOS und Android.
+ Die Serverseitigen Komponenten der Anwendung sollen weitestgehend horizontal skalierbar sein. Auch wenn sie im Zuge des Projektes nicht horizontal skaliert werden.
+ Zuverlässigkeit (Reliability)
  + Die Anwendung wird ausreichend für Demozwecke bereitgestellt und soll in diesem Umfang verfügbar, leistungsfähig genug sowie zuverlässig sein.

// - Klassendiagramm mit den Entitäten
//   - Erstellen Sie ein Klassendiagramm, in dem Sie die geplanten Entitäten mit ihren Beziehungen darstellen.
//   - Erläutern Sie kurz die Entitäten sowie deren Beziehungen zueinander.

== Anforderungen außerhalb des Projektziels (Non-Goals)
Die Anwendung ist nicht für die Zeiterfassung von Organisationen gedacht sofern sie aus mehr als einem Arbeitnehmer bestehen. Es soll keine Verwaltung von Nutzenden für Organisationen geben.
Die Anwendung wird während des Projektes für Demozwecke bereitgestellt. Jedoch wird sie aus Kostengründen nicht in einer Form bereitgestellt, dass sie besonders hohen Andrang oder Leistungsfähigkeit oder Zuverlässigkeit bietet. Bereitstellung einer Produktionsumgebung ist außerhalb des Projektziels. Persistenz der Daten über lange Zeiträume ist ebenfalls nicht garantiert.

== Erweiterungen
Die Anwendung soll in Zukunft erweiterbar sein um Nutzenden in Zukunft ermöglichen, ihre Arbeitszeiten Projekten zuzuordnen. Dies ist jedoch nicht das primäre Ziel der Anwendung und wird gegebenenfalls in einem späteren Projekt ergänzt.

#pagebreak()
= Anwendungsfälle (Use-Cases)

Nutzende können mit der Anwendung ihre Arbeitszeiten aufzeichnen, exportieren, importieren, löschen und bearbeiten.
Eine Arbeitszeit ist einem Projekt zugeordnet und Nutzende können Projekte erstellen, bearbeiten und löschen.
Zudem können Nutzende ihre Arbeitszeiten exportieren und importieren.
Um die Erfassung von Zeiten zu vereinfachen können Nutzende einen Timer verwenden. Für diesen können sie optional Benachrichtigungen zur Erinnerung aktivieren.

#figure(
  image("Use Case Diagram Time.svg", width: 50%),
  caption: [Time Tracking Use Case Diagram],
) <use-case-time>

#pagebreak()
Nutzende können sich mit der Anwendung authentifizieren und sich mit einem Passkey registrieren. Passkeys können mit einem Label versehen werden um eine einfachere Wiedererkennung zu ermöglichen. Zudem können Nutzende Details zu ihren Passkeys einsehen wie der benutzte Authenticator.

#figure(
  image("Use Case Diagram Auth.svg", width: 50%),
  caption: [Auth Use Case Diagram],
) <use-case-auth>


#pagebreak()
= Entitäten

/*
@startuml
skinparam classAttributeIconSize 0
hide circle

class User {
  + id: UUID
  + name: String
  + email: String
  + notifications_enabled: Boolean
  + created_at: DateTime
}

class "Time Entry" as TimeEntry {
  + id: UUID
  + start_time: DateTime
  + end_time: DateTime
  + notes: String
}

class Project {
  + id: UUID
  + name: String
  + description: String
  + color_code: String
}

class Organization {
  + id: UUID
  + name: String
}

class Timer {
  + id: UUID
  + start_time: DateTime
}

class "WebAuthn User" as WebAuthnUser {
  + webauthn_user_id: String
}

class "WebAuthn Credential" as WebAuthnCredential {
  + id: String
  + name: String
  + public_key: Bytes
  + created_at: DateTime
  + last_used_at: DateTime
  + last_used_from: String
  + device_type: String
  + signature_counter: Integer
  + transports: String[]
}

class "WebAuthn Authenticator" as WebAuthnAuthenticator {
  + aaguid: String
  + Name: String
  + dark_icon: String
  + light_icon: String
}

' Beziehungen
User "1" *-- "0..*" TimeEntry : erfasst >
User "1" *-- "0..*" Project : erstellt >
User "1" *-- "0..1" Timer : hat aktiven >
User "*" *-* "*" Organization : teil von
Project "*" *-- "1" Organization : zugeordnet zu

Project "0..1" <-- "0..*" TimeEntry : zugeordnet zu <

User "1" -- "0..1" WebAuthnUser : ist verknüpft mit >
WebAuthnUser "1" *-- "1..*" WebAuthnCredential : besitzt >
WebAuthnCredential "1" -- "1" WebAuthnAuthenticator : läuft auf >

@enduml
*/

// - User
// - Time Entry
// - WebAuthn User //TODO explain why separate from user
// - WebAuthn Credential
// - WebAuthn Authenticator
// - Timer
// - Project
// - Sessions
// - Reset links
// - WebPush Subscription?

Im Zentrum der Anwendung steht die User-Entität. Sie wird genutzt um alle Daten mit einer Person zu verknüpfen. Nutzende haben in dieser Version der Anwendung noch keinen Namen, da dies an keiner Stelle benötigt wird. Bei System mit mehreren Nutzenden wäre ein Name zur Identifizierung der Nutzer untereinander nötig aber da Nutzende nicht miteinander interagieren wird hier auf die Minimalisierung von erfassten Daten bevorzugt.
Nutzende können ein oder mehrere Projekte erstellen unter denen Sie Zeiten erfassen können. Es besteht zu jeder Zeit mindestens ein Standardprojekt, das nicht gesondert angelegt werden muss, damit Nutzende sofort starten können Zeiten zu erfassen.
Für Timer besteht eine Entität damit Timer auch über Neustarts der Anwendung weiterhin bestehen können. Sie haben nur eine Startzeit, da sie bei Beendigung direkt gelöscht werden und in die erfassten Zeiten überführt werden.
Separat zu User existieren WebAuthn-User über eine 1:1 Verbindung, die mit einem Passkey (WebAuthn-Credential) verknüpft sind. Diese werden separat gehalten um die Authentifizierung und Autorisierung einfacher aus dem System ausgliedern zu können oder das ganze Modul eventuell zu löschen.
Um Passkeys besser wieder zu erkennen wird zusätzlich Metadaten wie Name und Icons von den verwendeten Authenticatoren gespeichert.

#figure(
  image("UML Class Diagram Entities.svg", width: 80%),
  caption: [Entities Class Diagram],
) <class-diagram-entities>

#pagebreak()

= Software-Architektur
Durch die Anforderungen des Moduls an dieses Projekt soll für diese Software zwei Komponenten entwickelt werden, die in einer zentralisierten Server-Client-Architektur arrangiert sind.
Die erste Komponente ist eine HTTP JSON API, die den REST-Prinzipien nach Fielding folgt @fielding_rest. Für die Endpunkte zur Authentifizierung, Autorisierung und Hosting des Clients wird von diesen Prinzipien eventuell abgewichen werden müssen, da der API-Server auch die Rolle des Authentifizierungs-Servers erfüllt.

Über die von der API bereitgestellten Endpunkte wird einer Client-Server-Architektur realisiert. Der Client ist eine Web-Anwendung, die die API-Endpunkte aufruft und die Daten aus der API abruft. Die API-Endpunkte werden von einem Server ausgeführt, der die Daten speichert und verarbeitet.
Zum Speichern der Daten kommt eine Datenbank wie eventuell PostgreSQL oder SQLite zum Einsatz.
SQLite würde sich anbieten, da dies das Deployment der Anwendung erleichtert, da SQLite nur eine persistente Datei im Dateisystem erfordert. Dahingegen benötigt PostgreSQL eine eigene Datenbankserverinstanz.
Zusätzllich wird für Authentifizierung über WebAuthn ein temporärer Speicher für Challenges benötigt, der mit einem Redis-Service umgesetzt werden kann. Um das Deployment der Anwendung simpel zu halten wird eventuell auf eine eigene Redis-Instanz verzichtet und stattdessen in der Server-Anwendung eine Tabelle zum Speichern der temporären Challenges eingebaut. Diese benötigt zudem einen regelmäßigen Background-Job um abgelaufene Challenges zu löschen damit die Tabelle nicht ohne Limitierungen zu groß wird. Ein weiterer Nachteil ist auch, dass die Zugriffszeiten auf diese Tabelle eventuell geringer sein werden als die Zugriffszeiten auf eine Redis-Instanz. Jedoch ist dies für das erste in diesem Projekt verkraftbar solange sie nur für Demonstrationszwecke verwendet wird und es das Deployment der Anwendung erleichtert.

Damit Nutzende die Anwendung nutzen können wird eine Single-Page-Application (SPA) implementiert. Diese greift über die von der API bereitgestellten Endpunkte auf die Daten zu und bietet eine Schnittstelle mit der Nutzende mit der Anwendung interagieren können.
Die Anwendung kann über moderne Webbrowser geöffnet und genutzt werden um die Anforderung an die Verfügbarkeit auf verschiedenen Plattformen zu erfüllen.
Das Hosting der der SPA wird dabei auch von der API übernommen, da dies die eine Cookie-basierte Authentifizierung erleichtert und Cross Origin Resource Sharing (CORS) vermeidet, da die SPA sowie die API auf der gleichen Domain erreichbar sind.


= Wireframes
Der erste Screen, den Nutzende sehen, ist der Sign-in Screen. Hier werden sie begrüßt und können über einen Button direkt anmelden mit ihrem Passkey falls sie sich bereits registriert haben.
Alternativ können sie sich mit einem neuen Passkey registrieren.

Die beiden Optionen sind am unteren Rand des Screens zu finden damit sie leicht auf mobilen Geräten auszuwählen sind. Auf Desktop-Geräten sind sie weiter in der Mitte des Screens damit sie leichter gefunden werden können.

Nach dem Sign-in sehen Nutzende ihre aktuellen Tage der Woche und erfasste Zeiten. Hier können sie Zeiten erfassen, bearbeiten und löschen.

Über ein Menü oben rechts können Nutzende sich abmelden oder zu ihren Passkey-Einstellungen gelangen.

Um schnell neue Zeiten zu erfassen oder einen Timer zu starten befindet sich in Reichweite des Daumens unten rechts ein Floating-Action-Button.


#figure(
  image("Wireframe Mobile.svg", width: 80%),
  caption: [Wireframes Mobile],
) <wireframes-mobile>


Auf Desktop-Geräten verschiebt sich die Anzeige in die Breite und kann mehr Daten nebeneinander anzeigen. Zudem befinden sich der Floating-Action-Button und das Menü oben links, da dies der Leserichtung der Nutzenden folgt, schneller gefunden werden kann und Erreichbarkeit mit dem Daumen nicht mehr erforderlich ist, da vermutlich eine Maus genutzt wird.

#figure(
  image("Wireframe Desktop.svg", width: 80%),
  caption: [Wireframes Desktop],
) <wireframes-mobile>

#figure(
  image("protype.png", width: 80%),
  caption: [Prototype],
) <prototype>

// - Beschreibung der Software-Architektur
//   - Welche Komponenten wollen Sie verwenden? Warum wählen sie diese aus?
//   - Zeichnen Sie eine grobe Darstellung der Software-Architektur mit allen relevanten Schnittstellen.
// TODO Temporal API

#pagebreak()
#bibliography("references.bib")
// PayScale. (January 12, 2024). Percentage of employees who work from home all or most of the time worldwide from 2015 to 2023 [Graph]. In Statista. Retrieved May 05, 2026, from https://www.statista.com/statistics/1450450/employees-remote-work-share/
