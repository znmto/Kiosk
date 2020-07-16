## Kiosk

<p align="center">
A live version of this project can be found <a target="blank" rel="noopener noreferrer" href="https://majora-563d6.web.app/">here</a>.
</p>

### `Architecture`

<img src="kiosk.png" alt="Kiosk"
	title="Kiosk Architecture"/>

### `Purpose`

This is a WIP social app to share current media activity among friends and view recommendations based on selections. Films and TV Series components pull data from [OMDB](https://www.omdbapi.com/), Games from [IGDB](https://www.igdb.com/discover) and Books from [Google Books](https://developers.google.com/books).

React with TypeScript is used client-side, with Cloud Functions acting as a proxy server external API
calls and DB subscriptions/triggers. Firestore is used for Authentication and as a Data Store.

React Context is used to persist user and selection data across components. React-Select is used to retrieve data from the external APIs. All lifecycle events are handled using React Hooks. Styling is achieved with a mix of Styled-Components and Material UI.

Using a Cloud Function as a gateway allows us to bypass CORS issues and listen for DB changes with hooks provided by Firebase such as `authOnCreate` or `authOnDelete`. It also provides a layer to handle some of the authentication logic.

Firestore expedites development by providing tooling for the database layer and deep integration with client-side JavaScript frameworks.

### `To Do`

0. ### Fix Chrome CSS issues (FF is ok...)

1. ~~Refactor hacky code.~~
2. ~~Implement shareable link for unauthenticated activity sharing.~~
3. ~~Add Types where missing/broken.~~
4. ~~Finish UI/UX.~~
5. ~~Local development walkthrough.~~
6. ~~Seed DB.~~
7. Implement friends and feed functionality. (LT)
8. Gather feedback.

### Created using [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), and [Google Firebase](https://firebase.google.com/).
