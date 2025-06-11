# 🛠️ Local development with @reef-chain/react-lib and reef-app (Yarn 4)

This guide explains how to develop `@reef-chain/react-lib` locally and link it dynamically to `reef-app` using **Yarn 4.9.2**.

---

## 📁 Folder structure

```
/react-lib       # Local clone of the library
/reef-app        # Local clone of the application
```

## 🚀 Setup steps

| Step | Command |
|------|---------|
| 1 | `git clone https://github.com/reef-chain/react-lib.git ~/react-lib` |
| 2 | `git clone https://github.com/reef-chain/reef-app.git ~/reef-app` |
| 3 | `cd ~/react-lib && yarn install` |
| 4 | Edit `~/reef-app/package.json` and replace the dependency line: <br> `"@reef-chain/react-lib": "portal:[FOLDER_LOCATION]/react-lib"` |
| 5 | `cd ~/reef-app && yarn install` |

Also, in `~/reef-app`, add a `.yarnrc.yml` file with:

```yaml
nodeLinker: node-modules
```

## ✅ Pre-requisites

- Yarn 4.9.2 enabled with Corepack:

```bash
corepack enable
yarn --version  # must show 4.9.2
```

## 🔍 How to check if the link is active

```bash
ls -l node_modules/@reef-chain/react-lib
# → should point to /home/pierre/react-lib

yarn why @reef-chain/react-lib
# → should show "portal:/home/pierre/react-lib"

🎉 It means the link is working!
```

You can also modify a file inside `react-lib/src` and check if the change is reflected immediately in `reef-app`.

---

## 🛠 Update `package.json` in reef-app

```json
"scripts": {
  "start": "cross-env NODE_OPTIONS='--preserve-symlinks' webpack-dev-server -d source-map --output-pathinfo"
}
```

Install `cross-env` if needed:

```bash
yarn add -D cross-env
```


# Steps before Deployment when developing with react-lib * 
Do not forget to publish the lib before app deployment! 

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.
