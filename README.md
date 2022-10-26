# CalcWaris
Modules to calculate inheritance based on islamic belief.
## Reference

We use  Ali, M. (2019). <i>Bagi Waris nggak harus Tragis.</i> Jakarta, Turos Khazanah Pustaka Islam, Indonesian translation for </br>
Ali, M. (2002). <i>Al-Mawaris fi Syari'ah al Islamiyyah fi Dhau' al-Kitab wa as-Sunah.</i> Kairo, Dar at-Taufiqiyah as reference. We prioritize majority opinion and mazhab syafii first.
## Installing

Using npm:

```bash
$ npm install calc-waris
```

## Example

```
import {Waris, Maurus, CalcWaris} from calc-waris

const calc = new CalcWaris(new Muwaris(false, {muwaris: 25000000}))
calc.push(new Waris(false, 'child',{lang: 'en'}))
calc.push(new Waris(false, 'child',{lang: 'en'}))
calc.push(new Waris(true, 'child',{lang: 'en'}))
calc.push(new Waris(true, 'none',{lang: 'en', isPartner: true}))
const result = calc.evaluate()
```
## Issue
Bug report and reach us <a hreff='https://github.com/nawarhasibuan/calc-waris/issues'>here</a>

## LICENCE
ISC