# SCCM_Tool<br>
Es muss die Datei dbzugang.js im Hauptverzeichnis liegen.<br>
Diese muss wiefolgt aussehen<br>
`module.exports = {
    datenbank: "dg_sccm",
    username: "dg",
    passwort: "Datagroup",
    port: 3306
}`<br>
Die Angben müssen entsprechend angepasst werden<br>
## GET Routes<br>
### Alle Systeme<br>
`http://[SERVERADRESS]:3003/api/db/all`<br>
Gibt alle Datensätze aus der Tabelle Systeme zurück.<br>
<br>
## POST Routes<br>

### Update eines Datensatzes<br>
Datensatz Updaten<br>
`http://[SERVERADRESS]:3003/api/db/update`<br>
#### Syntax<br>
`{
	"table": "systeme",
	"set": {
		"Status": "Versendet"
	},
	"where": {
		"SN": "3CG612422"
	}
}`<br>

### Hinzufügen eines Datensatzes<br>
Neuen Datensatz hinzufügen.<br>
`http://[SERVERADRESS]:3003/api/db/add`<br>
#### Syntax<br>
`
{
	"table": "systeme",
	Bemerkung: "",
	"data": {
		"SN": "3CG612422",
		"LSNummer": "2019-87456",
		"Status": "Neu Angelegt",
		"Modell": "850G5",
		"Kunden_ID": 1,
		"Betankungs_ID": 2,
		"Versand_ID": "NULL",
		"Checklisten_ID_Done": "1",
		"Lager_ID": 2,
		"Job_ID": 1
	}
}
`<br>

### Einen einzelnen Datensatz abrufen<br>
Einen einzelnen Datensatz abrufen.<br>
`http://[SERVERADRESS]:3003/api/db/get`<br>
#### Syntax<br>
`
{
"data": {
	"table": "status",
	"where": {
		"SN": "3CG612422"
	}
 }
}
`<br>

### Excel Datensatz importieren<br>
Ein Excel Datensatz aus KHK importieren<br>
`http://[SERVERADRESS]:3003/api/db/add/excel`<br>
#### Syntax<br>
`
{
	"table": "systeme",
	Bemerkung: "",
	"data": {
		"SN": "3CG612422",
		"LSNummer": "2019-87456",
		"Status": "Neu Angelegt",
		"Modell": "850G5",
		"Kunden_ID": 1,
		"Betankungs_ID": 2,
		"Versand_ID": "NULL",
		"Checklisten_ID_Done": "1",
		"Lager_ID": 2,
		"Job_ID": 1
	}
}
`<br>
### CHeckliste zu Gerät hinzufügen/bearbeiten<br>
Einem System Checklisten Parameter hinzufügen. Wenn bereits eine Checkliste besteht wird diese Updated.<br>
`http://[SERVERADRESS]:3003/api/db/add/checklisteSN`<br>
#### Syntax<br>
`
{
	"table": "checklisten",
	{
        Seriennummer: system.Seriennummer,
        SCCM_Anlage: system.SCCM_Anlage,
        PXE_Start: system.PXE_Start,
        Bootstick_Start: system.Bootstick_Start,
        Bemerkung: system.Bemerkung,
        Computername: system.Computername,
        Software: system.Software,
        BIOS: system.BIOS,
        timestamp: system.timestamp  
    }
}
`<br>