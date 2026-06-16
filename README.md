# Vicugna

## app

Expo Router screens live here. Screens handle navigation, user interaction, and calling hooks.

## hooks

React state lives here. Hooks call database DAL functions and expose state to screens.

- Read hooks subscribe to DAL read functions and return `{ data, loading, error }`.
- Write hooks call DAL mutations and return actions plus saving/deleting/error state.

## database

WatermelonDB setup, schemas, models, mappers, and DAL functions live here. React code should not live in this folder.

## components

Reusable UI components live here. Components should stay dumb and receive data/actions through props.

## definitions

Shared TypeScript app types live here. These types describe app data, not WatermelonDB models.

## assets

Static data, images, and fonts live here. Screens and helpers can read these as fixed app resources.
