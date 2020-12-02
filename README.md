# speech-games-client

This project provides simple games for speech therapy. 

It is entirely implemented in client-side javascript and only accesses a minimal json-server (see https://github.com/isawzz/speech-games-server) to store user data.

run it online:
goto: 

run it locally (dev):
easiest way to run this locally if you have vs code installed:
1. clone the repos in a directory

2. open directory in vs code

3. if you do not have Live Server extension, install it in vs code extensions tab

4. press GoLive

5. start in SIM directory 

S/settings contains a settings file settings.yaml that can be adapted to use the implemented games with different parameters. right now, just file editing in program (computer icon) works! (gear icon NOT IMPLEMENTED!)

Note: HAS ONLY BEEN TESTED ON *** GOOGLE CHROME ***

trouble-shooting: 
- use F12 in Chrome to see error messages
- if you get ERR_CONNECTION_REFUSED, look at the file SIM/globals.js and set OFFLINE=false if you do not run the speech-games-server locally (it will start server on heroku)

=> please send bugs or questions to a_leeb@yahoo.com
