
# Welcome to Plural
<img src="www/public/plural-lockup-dark.png" width=30%/>
<p>
  <a href="https://discord.gg/CKc2kfeXxQ" target="_blank">
    <img alt="Discord" src="https://img.shields.io/discord/880830238723047424?style=flat-square">
  </a>
  <a href="#contributing">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square">
  </a>
  <img alt="GitHub language count" src="https://img.shields.io/github/languages/count/pluralsh/plural">
  <img alt="GitHub top language" src="https://img.shields.io/github/languages/top/pluralsh/plural">
  <img alt="GitHub code size in bytes" src="https://img.shields.io/github/languages/code-size/pluralsh/plural">
  <img alt="GitHub issues" src="https://img.shields.io/github/issues/pluralsh/plural">
  <img alt="GitHub closed issues" src="https://img.shields.io/github/issues-closed/pluralsh/plural">
  <img alt="GitHub pull requests" src="https://img.shields.io/github/issues-pr/pluralsh/plural">
  <img alt="GitHub contributors" src="https://img.shields.io/github/contributors/pluralsh/plural">
  <img alt="GitHub commit activity" src="https://img.shields.io/github/commit-activity/m/pluralsh/plural">
  <img alt="GitHub Org's stars" src="https://img.shields.io/github/stars/pluralsh?style=social">
  <img alt="YouTube Channel Views" src="https://img.shields.io/youtube/channel/views/UCKpIHwAFwvXhM-RaR1h77Jw?style=social">
</p>


## What is Plural?

Plural is a unified application deployment platform that makes it easy to run open-source software on Kubernetes. It aims to make applications as portable as possible, without sacrificing the ability for the users to own the applications they desire to use.

The plural platform ingests all deployment artifacts needed to deploy cloud-native applications and tracks their dependencies, allowing for seamless installations and no-touch upgrades post-install. All applications are managed via GitOps, allowing you to reconfigure them at will, or even eject them from Plural entirely.  It's your application, we just want to help you use it as easily as possible.

## A Video Demo

https://user-images.githubusercontent.com/28541758/164427949-3f14cfbb-cf5e-40dc-8996-385691ec2f01.mp4

## Getting Started

1. Go to https://app.plural.sh to create an account. Note: This is simply to track your installations and allow for the delivery of automated upgrades, you will not be asked to provide any infrastructure credentials or sensitive information.
2. Install the Plural CLI by following steps 1, 2, and 3 of the [Getting Started guide](https://docs.plural.sh/getting-started).
3. [Create and initialize a new git repo](https://docs.plural.sh/getting-started#4.-create-and-initialize-plural-repo) to store your Plural installation.
4. Install, build and deploy applications from the Plural catalogue by following steps 5 and 6 of the [Getting Started guide](https://docs.plural.sh/getting-started#5.-install-plural-applications).
5. [Install the Plural Management Console](https://docs.plural.sh/getting-started#7.-install-plural-admin-console).

You should now have a fully functioning Plural environment with apps and the management console running. For more details or further information check out the rest of the docs on the docs below.

## Documentation

* The full documentation is available on our [Documentation site](https://docs.plural.sh/).

## The Plural Workflow

The workflow is literally two commands:

```bash
plural build
plural deploy
```

Our tooling will take care of the rest.

## Features

The Plural platform provides the following:

* Authenticated docker registry per repository.
* Authenticated chartmuseum proxy for each repository.
* Secret encryption using AES-256 (so you can keep the entire workflow in git).
* Dependency management between tf/helm modules, with dependency aware deployment in the CLI.
* Dependency aware automatic upgrades.
* Billing management, with line item billing, usage limiting, and feature differentiation (core SaaS pricing constructs).
* OIDC provider to enable zero touch login security for all Plural applications.
* DNS service to register fqdns under onplural.sh to eliminate the hassle of dns registration for users.
* Security scanning of all docker images, helm charts, and terraform modules so you know exactly what you're installing.
* Unified incident management, ensuring all Plural applications have a consistent, top-quality support experience.

Also check out the [Plural Console](https://github.com/pluralsh/console) for our feature rich administration console to help you manage any plural applications with ease.

## Community Support

For general help, please refer to the Plural documentation. For additional help you can use the following channels:

* [Discord](https://discord.gg/CKc2kfeXxQ) (For live discussions with the Plural team)
* [GitHub](https://github.com/pluralsh/plural/) (Bug reports, feature requests, contributions)
* [Twitter](https://twitter.com/plural_sh) (For our latest news)

## Get Free Swag!

Get free Plural swag [here](https://pluralsh.typeform.com/to/jMj5GaM4) :-)

## Development

Plural's server side is written in elixir, and exposes a graphql api. The frontend is in react, all code lives in this single repo and common development tasks can be done using the Makefile at the root of the repo.


### Developing Web
To begin developing the web app, install [node](https://nodejs.org/en/download/) & [yarn](https://classic.yarnpkg.com/en/docs/getting-started/), then run:

```sh
cd www && yarn install && cd ..
make web
```

In chrome, you may get a warning saying "Your connection is not private". To resolve it, enable the `chrome://flags/#allow-insecure-localhost` flag and restart your browser.

### Developing Server

To make changes to the server codebase, you'll want to [install elixir](https://elixir-lang.org/install.html) on your machine. For mac desktops, we do this via [asdf](https://asdf-vm.com/guide/getting-started.html), which can be done simply at the root of the repo like so:

```sh
asdf plugin add erlang
asdf plugin add elixir
asdf install
```

asdf can be finnicky when instlalling erlang with mac, in which case you can reshim it like so from homebrew:

```sh
brew install erlang@23
cp -r /opt/homebrew/opt/erlang@23/lib/erlang ~/.asdf/installs/erlang/23.2
asdf reshim erlang 23.2
```

<!-- >
  Remove this line if irrelevant in the future
</!-->
In case you're running into this error: `configure: error: cannot find required auxiliary files: install-sh config.guess config.sub` you may consider this [GitHub issue](https://github.com/asdf-vm/asdf-erlang/issues/195#issuecomment-815999279)

All server dependencies are managed via [docker-compose](https://www.docker.com/):

```sh
docker compose up
```
`
Tests can be run via `mix`, like so:

```sh
make testup
mix test
```

### Server Architecture

The Plural server codebase uses an elixir umbrella application to organize itself, and splits into three main deployments:

* api - hosting the main graphql api
* worker - background workers, for things like upgrade delivery and artifact scanning
* rtc - for all websocket facing communication

These apps will all depend on core, where most Plural business logic should live, and their releases are configured under `/rel`.

### Email Development

We use elixir's bamboo framework for templating and delivering emails, one benefit of which is it creates a local server to view in-progress emails.  You can get this set up by doing:

```bash
mix ecto.create && mix ecto.migrate # ensure your dev db is set up
cd apps/email && iex -S mix phx.server
```

You should be able to view your emails at http://localhost:4002/sent_emails

You'll need to send an email to see them, which you can use the iex repl to do for you.

To actually write an email, you'll want to modify the templates in `apps/email/lib/email_web/templates/email` and the layout is in `apps/email/lib/email_web/templates/layout/email.html.eex`

## Roadmap
See what we're working on in these GitHub projects. Help us prioritize issues by reacting with an emoji on the issue!
* Application Onboarding Roadmap: https://github.com/orgs/pluralsh/projects/2/views/2
* Plural Core Issues: https://github.com/pluralsh/plural/issues
* Plural CLI Issues: https://github.com/pluralsh/plural-cli/issues

## Contributing

We love contributions to Plural, big or small! If you're not sure where to start, or if you have any questions, please open a draft PR or visit our [Discord](https://discord.gg/CKc2kfeXxQ) server where the core team can help answer your questions.

## License

See [LICENSE](LICENSE) for licensing information.
