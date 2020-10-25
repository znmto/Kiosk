## Kiosk

<p align="center">
A live version of this project can be found <a target="blank" rel="noopener noreferrer" href="https://majora-563d6.web.app/">here</a>.
</p>

### `Architecture`

<img src="kiosk.png" alt="Kiosk"
	title="Kiosk Architecture"/>

### `Purpose`

Kiosk allows users to search for what they're currently watching, reading and playing. Based on their selections, they can view recommendations from other users that have a selection in common with them. They can also share their current profile with a publicly accessible link. Films and TV Series components pull data from [OMDB](https://www.omdbapi.com/), Games from [IGDB](https://www.igdb.com/discover) and Books from [Google Books](https://developers.google.com/books).

React with TypeScript is used client-side, with Cloud Functions acting as a proxy server external API
calls and DB subscriptions/triggers. Firestore is used for Authentication and as a Data Store.

React Context is used to persist user and selection data across components. The callback of the React-Select onChange handler sends a request to the appropriate Cloud Function and then displays the data from the external API response in a list for the user to make a selection. All lifecycle events are handled using React Hooks. Styling is achieved with a mix of Styled-Components and Material UI.

Using a Cloud Function as a gateway allows us to bypass CORS issues and listen for DB changes with hooks provided by Firebase such as `authOnCreate` or `authOnDelete`. It also provides a layer to handle some of the authentication logic.

Firestore expedites development by providing tooling for the database layer and deep integration with client-side JavaScript frameworks.
