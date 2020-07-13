# Generic Research Hub UI application

This UI project was generated based on the [Grove React template, version 1.0.0-rc.1](https://github.com/marklogic-community/grove-react-template/tree/1.0.0-rc.1). See that template and the [Grove documentation](https://marklogic-community.github.io/grove/) for more background information.

## About This Project

The reference project includes three directories: 'ui' (for React.js front-end and Redux client-state management code), 'middle-tier' (for a Node Express.js middle-tier).

When you run the following commands from this `ui` directory, it will take appropriate actions within the `middle-tier` and `ui` applications as well:

1. `npm install`: installs npm dependencies within the Node `middle-tier` and the `ui` applications, as well as some helpful dependencies in the top coordinating directory. You can see the results of this operation in `ui/node_modules`, `ui/middle-tier/node_modules`, and `ui/ui/node_modules`.

2. `npm start`: This is the appropriate command to start a **development** server. It starts the Node middle-tier using `nodemon`, as well as a Webpack development server to serve up HTML, Javascript and CSS on port 3000. Both the middle-tier and UI will hot reload when source code files are saved. In the case of the middle-tier, this means you will need to re-authenticate after saving source files.

3. `npm run start:prod`. This is the appropriate command to start a production-optimized version of the application. It assumes that you have already successfully run `npm run build` (see below).

4. `npm run build`. This will build the UI into static HTML and JS assets, appropriate for production-like deployments. You can see the results in `ui/ui/build`.

5. `npm run lint` and `npm run lint:fix`. These commands will lint the middle-tier and UI code according to our ESLint / Prettier linting configuration. Note that you will need to lint cleanly before running tests or building the UI into static assets. You can automatically fix many linting inconsistencies using the `npm run lint:fix`. It will only make safe changes. You will have to manually fix anything that could change the logic of the application.

6. `npm test`. This will run the test suites in the middle-tier and UI applications.

## Adding a new environment

Assuming we want to add `ui/middle-tier/.env.mac` to hold environment variables for a Mac environment.

1. Create `ui/middle-tier/.env.mac` and declare the variables for this environment.

        GROVE_ML_HOST=<ml host>
        GROVE_ML_REST_PORT=8011
        GROVE_APP_PORT=9003

2. Open `ui/package.json` and add entries:

        "start:mac": "concurrently --kill-others \"npm run middleTier:mac\" \"npm run ui\" ",
        "middleTier:mac": "cd middle-tier && npm run start:mac",

    under the `script` property.

3. Open `ui/middle-tier/package.json` and add entries:

        "start:mac": "cross-env NODE_ENV=mac nodemon node-app.js",

    under the `script` property.

4. Run the UI in `mac` environment:

        npm run start:mac

### UI

The `ui` part of this project was built using the [Create-React-App library](https://github.com/facebookincubator/create-react-app), in order to rely on expert community help in staying up-to-date as the ecosystem changes. Much configuration is done using the tools provided by that library. Please refer to their extensive [User Guide](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md) to understand how to configure various parts of the `ui` application.

### Middle-Tier

The `middle-tier` part of this project is an [Express.js](https://expressjs.com/) application.

## Development on this project

To install dependencies:

    npm install

To start a development server at `localhost:3000`:

    npm start

To run the tests:

    npm test

To run the linting tools (it is also recommended that you set up ESLint / Prettier integration in your code editor for useful warnings and suggestions):

    npm run lint

perhaps followed by:

    npm run lint:fix

UNUSUAL: If you need to change the shared configuration between the two tiers (`middle-tier` and `ui`), you can run this after [installing the grove-cli](https://github.com/marklogic-community/grove-cli):

    grove config # You probably do not need to run this

For more discussion about how to make changes to your Grove project see the "Learning to Customize and Extend Your Application" section of [GUIDE.markdown](docs/GUIDE.markdown#developing-your-app) in this repository.

## HOW TO UPDATE THE UI IN AWS


### Update Grove in the TEST environment

We have a server running in AWS that serves the Grove UI. It is available at: `http://34.227.148.138`. Use credentials rpaas / Yj7rM9MFgwv7FBKbjDBF!.

In order to update, you will need SSH access to the `rpaas` user at ec2-34-227-148-138.compute-1.amazonaws.com (ask the team to add your public key).

Then run these commands to deploy the latest UI, entering your MarkLogic root username and password when prompted:

    cd ~/work/grh
    git checkout develop
    git pull origin develop
    cd ui
    npm install
    NODE_ENV=production npm run build

The build should finish successfully. It may fail if the code fails to pass muster with the linter (hopefully not). If this becomes a problem, we could consider disabling the lint before build. But it would be better if we could keep the code in the develop branch clean.

At the moment, we are just running the server from inside a screen session, for durability between SSH sessions. We have plans to improve this, most likely using pm2. But, for now, attach to the screen session for the `rpaas` user:

    screen -r

Hit <Ctrl-C> to stop the server. Then run this to restart it:

    npm run start:test

You can detach from the screen session by hitting:

    <Ctrl-a>d

### Update Grove in the rpaas-dev/prh-blue environment

We have a server running in AWS that serves the Grove UI. It is available at: `http://3.220.7.155/` `http://ec2-3-220-7-155.compute-1.amazonaws.com/`. <br>
Use credentials demo / demo.

In order to update, you will need SSH access to the `ec2-user` user at ec2-3-220-7-155.compute-1.amazonaws.com (ask the team to add your public key).

Then run these commands to deploy the latest UI, entering your MarkLogic root username and password when prompted:

    cd /code/grh
    git checkout develop
    git pull origin develop
    cd bin
    ./ui-rebuild.sh

The build should finish successfully. It may fail if the code fails to pass muster with the linter (hopefully not). If this becomes a problem, we could consider disabling the lint before build. But it would be better if we could keep the code in the develop branch clean.

You may run gradle commands to update the modules or data.

Finally, reload the UI by running:
    cd /code/grh/bin
    ./ui-reload.sh

### Update Grove in the Production environment

We have a server running in AWS that serves the Grove UI. It is available at: `http://34.202.202.176`. Use credentials demo / demo.

We call this the "Production" environment.

In order to update, you will need SSH access to the `rpaas` user at ec2-34-202-202-176.compute-1.amazonaws.com (ask the team to add your public key).

Then run these commands to deploy the latest UI, entering your MarkLogic root username and password when prompted:

    cd ~/work/grh
    git checkout develop
    git pull origin develop
    cd ui
    npm install
    NODE_ENV=production npm run build

The build should finish successfully. It may fail if the code fails to pass muster with the linter (hopefully not). If this becomes a problem, we could consider disabling the lint before build. But it would be better if we could keep the code in the develop branch clean.

At the moment, we are just running the server from inside a screen session, for durability between SSH sessions. We have plans to improve this, most likely using pm2. But, for now, attach to the screen session for the `rpaas` user:

    screen -r

Hit <Ctrl-C> to stop the server. Then run this to restart it:

    npm run start:prod

You can detach from the screen session by hitting:

    <Ctrl-a>d

## Run this project in production

This command will build the `ui` into static files and start the Node middle-tier in production. The Node middle-tier will serve those static UI files. See `middle-tier/README.markdown` if you need to configure how that works, or the path to the static files. **Note that it is a better practice to set up a reverse proxy like Nginx or HAProxy to serve these static files instead, but this will do.**.

If you have not already done so, you will need to build your current UI into static files within the `ui/build` directory. You may want to set `NODE_ENV` to "production", so the build process includes all production optimizations.

    NODE_ENV=production npm run build

Then you can run:

    npm run start:prod

By default, `start:prod` will set `NODE_ENV` to "production", and it will tell the middle-tier to serve the built UI from `ui/build`, by setting `GROVE_UI_BUILD_PATH` to "../ui/build". You can modify this command if, for example, you are following best practices and serving the UI files from a reverse proxy.

Note that this will run on `http://localhost:9003` by default (rather than port 3000, where the development Webpack server runs by default).

You can more durably set the `GROVE_UI_BUILD_PATH` in  `middle-tier/.env` or `middle-tier/.env.production` (or some other `.env` file) rather than specifying it on the command line. Just add the line:

    GROVE_UI_BUILD_PATH=../ui/build

## UI and Middle-Tier Application Documentation

Much additional documentation is available in `ui/README.markdown` and `middle-tier/README.markdown` about the UI and middle-tier specifically. Please also look there for information.

## Customizing

As you work with your Grove Project, you will soon want to customize it. To understand the design of the UI-Toolkit and how to customize it to your needs, is most important to understand how to use Grove to quickly create a MarkLogic-backed project - and then to customize it. For this, please *read [the Advanced Guide to Grove](docs/GUIDE.markdown)*.

For those seeking to contribute to the project, our evolving [Best Practices document](docs/BEST_PRACTICES.markdown) are designed to get contributors on the same page and to communicate some of our goals. The [Contributing document](docs/CONTRIBUTING.markdown) has additional concrete advice for contributors. Please read both.

## Developing Pieces of Grove Itself

**NOTE: This section is currently out-of-date! Updates coming soon.**

For those seeking to contribute to the project, our evolving [Best Practices document](docs/BEST_PRACTICES.markdown) are designed to get contributors on the same page and to communicate some of our goals. The [Contributing document](docs/CONTRIBUTING.markdown) has additional concrete advice for contributors. Please read both.
