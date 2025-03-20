# AbortController API Demo

This is a brief demo showcasing the capabilities of the AbortController &
AbortSignal APIs which can be used to not only cancel requests, but also to
remove one or multiple event handlers at once. The demo also shows how you can
combine multiple signals into a single one using AbortSignal.any() or how
you can create a signal that automatically aborts after a given number of
milliseconds using the AbortSignal.timeout() method.

## Install & run

To install and run the app, enter the following commands in the console/terminal:

```
npm i
npm run dev
```

You can now open the app at http://localhost:5173