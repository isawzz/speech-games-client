# speech-games-client

This project provides simple games for speech therapy:
- Pictures: click one of multiple pictures given word
- Colors: identify 2 attributes: content + color 
- Premem: find similar pictures
- Memory: memorize one or multiple pictures, after some time, recall it and click
- Sequence: fill out missing number in a number sequence built using + or - some constant
- Letters: enter missing letters in a word
- Type it: type a word given picture
- Speak Up: speak a word given picture

There is also a calibration test CALIBRATE for the user to set all the games to the right level 

run it online:
goto: https://isawzz.github.io/speech-games-client/SIMA/


# implementation

It is entirely implemented in client-side javascript and only accesses a minimal json-server (see https://github.com/isawzz/speech-games-server) to store user data.

run it locally (dev):
easiest way to run this locally if you have vs code installed:
1. clone the repos in a directory

2. open directory in vs code

3. if you do not have Live Server extension, install it in vs code extensions tab

4. press GoLive

5. ===> start in SIMA directory 

S/settings contains a settings file settings.yaml that can be adapted to use the implemented games with different parameters. right now, just file editing in program (computer icon) works! (gear icon NOT IMPLEMENTED!)

Note: HAS ONLY BEEN TESTED ON *** GOOGLE CHROME ***

trouble-shooting: 
- use F12 in Chrome to see error messages
- if you get ERR_CONNECTION_REFUSED, look at the file SIM/globals.js and set OFFLINE=false if you do not run the speech-games-server locally (it will start server on heroku)

=> please send bugs or questions to a_leeb@yahoo.com
