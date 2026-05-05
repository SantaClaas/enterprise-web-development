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

Die in diesem Projektkonzept beschriebene Anwendung ist als digitale Zeiterfassung für Werkstudenten konzipiert. Für die Priorisierung der Entwicklung wird zwischen einer primären und einer erweiterten Zielgruppe unterschieden. Zur primären Zielgruppe zählen Studierende, die als Werkstudenten tätig sind und ihre Arbeitszeiten außerhalb eines von Arbeitgebern bereitgestellten Zeiterfassungssystems dokumentieren möchten. Die erweiterte Zielgruppe umfasst selbstständig Tätige mit vergleichbaren Anforderungen an die Erfassung von Arbeitszeiten.

Die Wahl von Passkeys als Anmeldeverfahren orientiert sich an WebAuthn und an FIDO-Passkeys, die auf kryptografischen Anmeldungen ohne klassische Passwörter beruhen und als phishing-resistente Alternative zu passwortbasierten Verfahren etabliert sind @webauthn_l2 @fido_passkeys.


Für das Projekt wird sich in erster Linie auf die primäre Zielgruppe konzentriert; die erweiterte Zielgruppe wird als sekundärer Anwendungsfall berücksichtigt.

Die Anwendung soll es Nutzenden ermöglichen, ihre Arbeitszeiten zu erfassen, zu exportieren und dabei die Kontrolle über die eigenen Daten zu behalten, ohne auf ein externes, für sie nicht einsehbares System angewiesen zu sein.
Dadurch erhalten sie eine eigenständige Dokumentation der geleisteten Arbeitszeit und reduzieren die Abhängigkeit von der korrekten Verarbeitung durch Systeme Dritter.

Ziel des Projekts ist nicht eine möglichst breit einsetzbare Lösung, sondern eine in ihrem Funktionsumfang bewusst begrenzte Anwendung mit hoher funktionaler Dichte und guter Gebrauchstauglichkeit. Dieses Vorgehen folgt dem Grundsatz eines reduzierten Systems mit geringer Interaktionskomplexität.

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
Im Folgenden werden die funktionalen und nicht-funktionalen Anforderungen aufgeführt. Die wesentlichen Use-Cases der Anwendung werden im Kapitel Use-Cases erläutert.
Einige Anforderungen erscheinen in mehreren Kategorien, etwa Barrierefreiheit, weil sie sowohl formale Konformitätskriterien als auch qualitative Anforderungen an die Nutzung betreffen.

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
  + Nutzende können Zeiten Projekten zuordnen.
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
  + Nutzende müssen Arbeitszeiten starten und stoppen können; die Arbeitszeit wird dabei automatisch aufgezeichnet.
+ Benachrichtigungen
  + Nutzende können regelmäßige Benachrichtigungen aktivieren, um an das Eintragen der Arbeitszeiten erinnert zu werden.
+ Die Anwendung soll in Deutsch und Englisch verfügbar sein.
+ Rechtliches (Compliance)
  + Barrierefreiheit (Accessibility): Die Anwendung soll WCAG 2.2 AA-konform sein. @w3c_wcag22
+ WebAuthn/Sign-in
  + Nutzende müssen sich mit einem Passkey registrieren können @webauthn_l2.
  + Nutzende müssen sich über einen Passkey authentifizieren können @webauthn_l2.
  + Nutzende können weitere Passkeys hinzufügen.
  + Nutzende können Passkeys löschen.
  + Hinzufügen, Editieren von Recovery-Email


== Nicht-Funktionale Anforderungen
+ Benutzerfreundlichkeit (Usability)
  + Die Anwendung soll intuitiv und einfach zu bedienen sein. Dazu soll die Benutzeroberfläche eine klare visuelle Hierarchie aufweisen und typische Aufgaben mit möglichst geringem Interaktionsaufwand unterstützen.
  + Die Eingabe von Zeiten sollte mit möglichst wenigen Tastatureingaben erfolgen.
+ Sicherheit (Security)
  + Daten werden verschlüsselt zwischen Client und Server gesendet.
  + Daten von Nutzenden sind sicher vor unauthorisierten Zugriffen geschützt.
+ Barrierefreiheit (Accessibility)
  + Dies ist sowohl eine funktionale als auch eine nicht-funktionale Anforderung. Funktional: Konformität mit den geforderten Standards. Nicht-funktional: eine über Mindestanforderungen hinausgehende Zugänglichkeit.
  + In funktionaler Hinsicht soll die Anwendung die rechtlichen Anforderungen erfüllen.
+ Fokus
  + Die Anwendung soll sich auf die primären Ziele konzentrieren und diese qualitativ hochwertig umsetzen, anstatt einen möglichst breiten Funktionsumfang anzustreben.
+ Plattformunabhängigkeit
  + Die Anwendung soll auf verschiedenen Plattformen lauffähig sein. Dazu gehören Windows, macOS, Linux, iOS und Android.
- Die serverseitigen Komponenten der Anwendung sollen weitestgehend horizontal skalierbar sein, auch wenn im Rahmen des Projekts keine horizontale Skalierung umgesetzt wird.
+ Zuverlässigkeit (Reliability)
  + Die Anwendung wird für Demonstrationszwecke bereitgestellt und soll in diesem Umfang verfügbar, leistungsfähig und zuverlässig sein.

// - Klassendiagramm mit den Entitäten
//   - Erstellen Sie ein Klassendiagramm, in dem Sie die geplanten Entitäten mit ihren Beziehungen darstellen.
//   - Erläutern Sie kurz die Entitäten sowie deren Beziehungen zueinander.

== Anforderungen außerhalb des Projektziels (Non-Goals)
Die Anwendung ist nicht für die Zeiterfassung innerhalb von Organisationen mit mehr als einer arbeitenden Person vorgesehen. Eine Verwaltung von Nutzenden innerhalb von Organisationen ist daher nicht Teil des Projektumfangs.
Während des Projekts wird die Anwendung für Demonstrationszwecke bereitgestellt. Aus Kostengründen ist keine Produktionsumgebung vorgesehen; entsprechend sind hohe Last, langfristige Datenpersistenz und maximale Verfügbarkeit nicht Teil des Zielsystems.

== Erweiterungen
Die Anwendung soll in Zukunft erweiterbar sein, um Nutzenden das nachträgliche Zuordnen von Arbeitszeiten zu Projekten zu ermöglichen. Dies ist jedoch nicht das primäre Ziel der Anwendung und wird gegebenenfalls in einem späteren Projekt ergänzt.

#pagebreak()
= Anwendungsfälle (Use-Cases)

Nutzende können mit der Anwendung ihre Arbeitszeiten aufzeichnen, exportieren, importieren, löschen und bearbeiten.
Eine Arbeitszeit ist einem Projekt zugeordnet; Nutzende können Projekte erstellen, bearbeiten und löschen.
Zur Vereinfachung der Zeiterfassung können Nutzende einen Timer verwenden. Für diesen können sie optional Benachrichtigungen zur Erinnerung aktivieren.

#figure(
  image("Use Case Diagram Time.svg", width: 50%),
  caption: [Time Tracking Use Case Diagram],
) <use-case-time>

#pagebreak()
Nutzende können sich mit der Anwendung authentifizieren und mit einem Passkey registrieren. Passkeys können mit einem Label versehen werden, um die Wiedererkennung zu erleichtern. Zudem können Nutzende Details zu ihren Passkeys einsehen, etwa den verwendeten Authenticator.

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

Im Zentrum der Anwendung steht die User-Entität. Sie dient dazu, sämtliche Daten einer Person zuzuordnen. In der aktuellen Version besitzt eine Person keinen Namen, da dieser an keiner Stelle benötigt wird. In einem System mit mehreren Nutzenden wäre ein Name zur gegenseitigen Identifikation sinnvoll; da Nutzende jedoch nicht miteinander interagieren, wird eine Minimierung der erfassten Daten bevorzugt.
Nutzende können ein oder mehrere Projekte erstellen, unter denen sie Zeiten erfassen können. Zu jedem Zeitpunkt existiert mindestens ein Standardprojekt, das nicht gesondert angelegt werden muss, damit die Zeiterfassung unmittelbar begonnen werden kann.
Für Timer existiert eine eigene Entität, damit laufende Timer auch über Neustarts der Anwendung hinweg erhalten bleiben. Sie speichern lediglich eine Startzeit, da sie bei Beendigung in die erfassten Zeiten überführt und anschließend entfernt werden.
Separat zur User-Entität existieren WebAuthn-User über eine 1:1-Beziehung, die mit einem Passkey (WebAuthn-Credential) verknüpft sind. Diese Trennung ermöglicht es, Authentifizierung und Autorisierung modular aus dem System auszugliedern oder das gesamte Modul später einfacher zu entfernen.
Zur besseren Wiedererkennung von Passkeys werden außerdem Metadaten wie Name und Icons der verwendeten Authenticatoren gespeichert.

#figure(
  image("UML Class Diagram Entities.svg", width: 80%),
  caption: [Entities Class Diagram],
) <class-diagram-entities>

#pagebreak()

= Software-Architektur
Durch die Anforderungen des Moduls an dieses Projekt soll für diese Software zwei Komponenten entwickelt werden, die in einer zentralisierten Server-Client-Architektur arrangiert sind.
Die erste Komponente ist eine HTTP-JSON-API, die den REST-Prinzipien nach Fielding folgt @fielding_rest. Für Endpunkte zur Authentifizierung, Autorisierung und zum Ausliefern des Clients kann davon abgewichen werden, da der API-Server zugleich die Rolle des Authentifizierungsservers übernimmt.

Über die von der API bereitgestellten Endpunkte wird eine Client-Server-Architektur realisiert. Der Client ist eine Webanwendung, die die API-Endpunkte aufruft und Daten aus der API darstellt. Der Server verarbeitet und speichert die Daten.
Für die persistente Speicherung kommen wahlweise PostgreSQL oder SQLite in Betracht. SQLite ist für einen schlanken Projekt- und Deployment-Setup vorteilhaft, da es als dateibasierte Datenbank ohne separates Datenbankserversystem betrieben werden kann @sqlite_docs. PostgreSQL stellt demgegenüber ein vollwertiges Datenbanksystem mit separater Serverinstanz bereit @postgresql_docs.
Zusätzlich wird für die WebAuthn-Authentifizierung ein temporärer Speicher für Challenges benötigt. Zur Vereinfachung des Deployments kann dieser Speicher in einer Servertabelle umgesetzt werden, sofern ein externer Redis-Dienst vermieden werden soll. In diesem Fall ist ein regelmäßiger Hintergrundjob erforderlich, um abgelaufene Challenges zu entfernen und ein unkontrolliertes Anwachsen der Tabelle zu verhindern.

Damit Nutzende die Anwendung verwenden können, wird eine Single-Page-Application (SPA) implementiert. Sie greift über die API auf die Daten zu und bildet die Benutzungsoberfläche der Anwendung.
Die Anwendung kann in modernen Webbrowsern auf unterschiedlichen Plattformen ausgeführt werden und erfüllt damit die Anforderung an Plattformunabhängigkeit.
Das Hosting der SPA erfolgt zusammen mit der API, da dies cookie-basierte Authentifizierung vereinfacht und Cross-Origin Resource Sharing (CORS) vermeidet, weil SPA und API unter derselben Domain erreichbar sind.


= Wireframes
Der erste Screen, den Nutzende sehen, ist der Sign-in-Screen. Dort können sie sich mit einem vorhandenen Passkey anmelden oder einen neuen Passkey registrieren.

Die beiden Optionen sind am unteren Rand des Screens angeordnet, damit sie auf mobilen Geräten leicht erreichbar sind. Auf Desktop-Geräten werden sie mittiger platziert, damit sie schneller wahrgenommen werden.

Nach dem Sign-in sehen Nutzende ihre aktuellen Tage der Woche und erfasste Zeiten. Dort können sie Zeiten erfassen, bearbeiten und löschen.

Über ein Menü oben rechts können Nutzende sich abmelden oder zu ihren Passkey-Einstellungen wechseln.

Um neue Zeiten schnell zu erfassen oder einen Timer zu starten, befindet sich unten rechts ein Floating-Action-Button in Daumenreichweite.


#figure(
  image("Wireframe Mobile.svg", width: 80%),
  caption: [Wireframes Mobile],
) <wireframes-mobile>


Auf Desktop-Geräten wird die Darstellung breiter und kann mehr Informationen nebeneinander anzeigen. Zudem befinden sich der Floating-Action-Button und das Menü oben links, da dies der Leserichtung folgt und mit einer Maus schneller erreichbar ist.

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
