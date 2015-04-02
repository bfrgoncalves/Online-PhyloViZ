
<img src="http://i.imgur.com/S2rgr.png"></img>

    
## hook.io is a versatile distributed event emitter built with node.js

## hooks are nodes which can seamlessly work together across any device or network to create self-healing meshes of i/o

## Features :

- **Build applications intelligently by combining together small hook actors**
- **Rapidly compose new functionality in a distributed and organized way**
- **Dead simple Inter Process Communication built on-top of node's native [EventEmitter][2] class**
- **Supports a large amount of common i/o sources out of the box**
- **Additional i/o support from a rich community and network of user-created [hook libraries](https://github.com/hookio/hook.io/wiki/Hook.io-Libraries)**
- **Built-in auto-discovery systems using http, tcp, mdns, and [hnet](http://github.com/hookio/hnet)**
- **Hooks can exist on any device that supports JavaScript (cross-browser support via [socket.io][1])**
- **Seamlessly manages the spawning and daemonizing additional hooks**
- **Legacy applications can easily be extended to work with hook.io**

# Installation

     [sudo] npm install hook.io -g

# Usage

If you are impatient and wish to jump straight to code, we have hundreds of code examples available here: [https://github.com/hookio/hook.io/tree/master/examples](https://github.com/hookio/hook.io/tree/master/examples)

- [using hook.io as a node.js script or as the hook binary](#script-versus-binary)
- [hook.io repl](#hook-repl)
- [hook configuration / construction](#basic-config-construct)
- [auto-discovery](#auto-discover)
- [messaging](#basic-messaging)
- [using PIPES](#hook-pipes)
- [using mdns](#hook-mdns)
- [enabling autohealing meshes](#hook-autoheal)
- [tapping into the hook.io library network](#hook-libraries)

<a name="script-versus-binary"></a>
## How to use hook.io as a node.js script or as the `hook` binary

hook.io works well as both the `hook` binary or required and used programmatically through node.js 

To use the `hook` binary simple type this on your terminal:

     hook

This will start up your first hook!

To execute this same action programtically we would create a myhook.js file that contained: 

```
var hookio = require('hook.io'),
    hook   = hookio.createHook();

    hook.start();

```
<a name="hook-repl"></a>
## hook repl

The hook repl provides an easy way to interact with a live hook.io mesh.

Simply type:

     hook --repl

**repl img here**

<a name="hook-config-construct"></a>
## hook configuration

<a name="hook-messaging"></a>
## hook messaging 

**Note:** This is only one, small, example.

To see all other supported types of hook messaging ( including EventEmitter and Callback style ), see: [https://github.com/hookio/hook.io/tree/master/examples/messaging](https://github.com/hookio/hook.io/tree/master/examples/messaging)

**hook a**

``` js
var hookio = require('hook.io');

var hookA = hookio.createHook({
  name: "a"
});
hookA.on('*::sup', function(data){
  // outputs b::sup::dog
  console.log(this.event + ' ' + data);
});
hookA.start();
```

**hook b**
``` js
var hookB = hookio.createHook({
  name: "b"
});
hookB.on('hook::ready', function(){
  hookB.emit('sup', 'dog');
});
hookB.start();
```

<a name="hook-pipes"></a>
## piping stdout and stdin through unix pipes

### pipe stdin to hookio

    tail foo.txt -f | hook 
    
**hook.io will now emit stdin data as separate hook events**

    
### pipe hook.io events to stdout

    hook -p | less

Using the `-p` option, hook.io will stream events to stdout as `\n` delimited JSON documents. Each document represents a single hook event.

**example stdout:**

    {"name":"the-hook","event":"the-hook::sup","data":{"foo":"bar"}}

<a name="hook-mdns"></a>
## multicast dns ( mdns )

[Multicast DNS (mdns)](http://en.wikipedia.org/wiki/Multicast_DNS) is a way of using [DNS](http://en.wikipedia.org/wiki/Domain_Name_System) programming interfaces, packet formats and operating semantics on a small network where no DNS server is running. The mDNS protocol is used by Apple's <a href="http://en.wikipedia.org/wiki/Bonjour_(software)">Bonjour<a/> and Linux <a href="http://en.wikipedia.org/wiki/Avahi_(software)">Avahi<a/> service discovery systems. mdns is an easy way to help networked devices find each other without any prior configuration.

hook.io has built-in experimental mdns support. This is intended to work on all operating systems and is intented for a way to provide<a href="http://en.wikipedia.org/wiki/Zeroconf">zero configuration networking</a> discovery and connection of hooks over a [Local Area Network](http://en.wikipedia.org/wiki/Local_area_network) ( LAN )

**IMPORTANT**

Before you can use the mdns feature, you will need to install a few additional dependencies.

     npm install mdns@0.0.4

MacOS and Windows should work out of the box. If you are running Linux, you may need to install the following libraries.

     apt-get install libavahi-compat-libdnssd-dev

**using mdns**

Computer 1

     hookio -m


Computer 2

    hookio -m

Now these two computers ( connected over a LAN, with no central DNS server ) will automatically discovery each other and begin to transmit messages. Think of the possibilities!

<a name="hook-libraries"></a>

# Hook Libraries

Wiki: [https://github.com/hookio/hook.io/wiki/Hook.io-Libraries](https://github.com/hookio/hook.io/wiki/Hook.io-Libraries)

You can also search [http://search.npmjs.org/](http://search.npmjs.org/) for "hook.io" ( although there are so many matches already, the search interface can't display them all.. )

## Tests

All tests are written with [vows](http:://vowsjs.org) and require that you link hook.io to itself:

``` bash
  $ cd /path/to/hook.io
  $ [sudo] npm link
  $ [sudo] npm link hook.io
  $ npm test
```
## Additional Resources

 - Email List: [http://groups.google.com/group/hookio][0]
 - Video Lessons: [http://youtube.com/maraksquires](http://youtube.com/maraksquires) ( [mirror](https://github.com/hookio/tutorials) )
 - Wiki Pages [https://github.com/hookio/hook.io/wiki/_pages](https://github.com/hookio/hook.io/wiki/_pages) 
 - [hook.io for dummies](http://ejeklint.github.com/2011/09/23/hook.io-for-dummies-part-1-overview/)
 - [Distribute Node.js Apps with hook.io: ][6]
 - #nodejitsu on irc.freenode.net
 

## Core Contributors ( https://github.com/hookio/hook.io/contributors )


## MIT License

Copyright (c) Nodejitsu

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[0]: http://groups.google.com/group/hookio
[1]: http://socket.io
[2]: https://github.com/hij1nx/EventEmitter2
[3]: http://github.com/SubStack/dnode
[4]: https://github.com/indexzero/forever
[5]: http://www.twilio.com/
[6]: http://blog.nodejitsu.com/distribute-nodejs-apps-with-hookio
