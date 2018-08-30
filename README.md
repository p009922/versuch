# Mock REST Server

This is only a mock-server - so do not expect a fully functional server with security incorporated.  All security aspects are currently ignored.  Also the data itself is hardcoded for testing only.


## Running

```bash
# once
npm install

# runs a local server, test: http://0.0.0.0:8081/workflows
npm start
```

## Deployment (on NodeJs)

Copy the `/dist` folder to the according server with NodeJS installed and start a background process with '`node server.js`' 


## Technical Problems ...

#### Server Port 8081 in use...

1. Error: `listen EADDRINUSE :::8081` <br>
	Solution:  kill the according process

	```bash
	lsof -i:8081
	COMMAND PID   USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME
	node    935 henner   12u  IPv6 0x6d1d39004e7214ab      0t0  TCP *:sunproxyadmin 	(LISTEN)
	
	kill 935
	```
	
--------------

## API-Documentation

...is online available via the URL (default index.html)


## Further Reading

* [API-Doc Generator](https://github.com/dzekevis/api-doc-generator#readme)
* 

## Contact
Henner Harnisch


