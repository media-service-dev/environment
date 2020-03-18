
# @mscs/environment

**Version:** 0.1.0-DEV

## Installation

```shell script
$ yarn add @mscs/environment
```

## Usage

Short example:

```typescript
import { EnvironmentLoader, ProcessEnvironment } from "@mscs/environment";

const environment = new ProcessEnvironment();
const environmentLoader = new EnvironmentLoader(environment);
environmentLoader.loadEnvironment(__dirname + '/../.env');

if(environment.has('FOO')){
    const foo = environment.get("FOO");
    // ...
}
```

*This example expect that you are in a root file of the `src` directory in your project.*

## Documentation

Currently, you have to build the documentation on your own.

```shell script
$ git clone git@github.com:media-service-dev/environment.git
$ cd environment
$ yarn
$ yarn run docs
```  

# Important note 

The parser for `.env`-files and the environment file loading order logic was ported from [Symfony](https://symfony.com/).

Since *Symfony* is, for good reason, a registered trademark, please take note that we are in no way associated with [the Symfony brand](https://symfony.com/) or the [SensioLabs](https://sensiolabs.com/) organization.
Therefore, we don't represent or speak for any of them.
