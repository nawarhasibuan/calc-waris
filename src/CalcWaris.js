import Waris from "./Waris.js"
import Muwaris from './Muwaris.js'
import Fraction from "fraction.js"
import { readFile } from 'fs/promises';

const json = JSON.parse(
    await readFile(
      new URL('../utils/relList.json', import.meta.url)
    )
  );
/**
 * 
 * This class offer a capability to calculate division of inheritance based on Islam.
 * Use the majority opinion of ulama as reference.
 * 
 * @author Panawar Hasibuan
 * @email panawarhsb28@gmail.com
 * @website http://www.lombang.com
 * @reference Ali, M. (2019). Bagi Waris nggak harus Tragis. Jakarta, Turos Khazanah Pustaka Islam.
 * @original Ali, M. (2002). Al-Mawaris fi Syari'ah al Islamiyyah fi Dhau' al-Kitab wa as-Sunah. Kairo, Dar at-Taufiqiyah
 */
class CalcWaris {
    /**
     * first column for son, grand son from son, ...
     * second column for father, grandfather, ...
     * third column for brother, brother in father, nephew (male), nephew (male) in father
     * fourth column for uncle, cousin (male), ...
     * @private
     * @property {matrix<4,4>} men the container for male heir count of family relation
     */
    #men = [
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0]
    ]
    /**
     * first column for child, grand child from son, ...
     * second column for mother, grand mother, ...
     * third column for sister, sister in father and sibling in mother
     * @private
     * @property {matrix<3,3>} women the container for male heir count of family relation
     */
    #women = [
        [0,0,0],
        [0,0,0],
        [0,0,0]
    ]
    /**
     * @property {number} numPartner count of partner belongs to muwaris
     */
    numPartner = 0
    /**
     * @property {number} numLiberator count of liberator
     */
    numLiberator = 0
    /**
     * Heirs
     * @property {<Waris>} warisatan heirs
     */
    warisatan = []
    /**
     * Constructor of CalcWaris, heirs portion calculator
     * @constructor
     * @param {Muwaris} muwaris inheritor
     */
    constructor(muwaris) {
        /**
         * @property {Muwaris} muwaris yang mewariskan
         */
        this.muwaris = muwaris;
    }
    /**
     * Getter of number of male heir
     * @param {number} i - index of row (power of heir)
     * @param {number} j - index of column (darajah of heir)
     * @returns {number} number of heir with (power,darajah) === (i,j)
     */
    getMan(i,j){
        if (i < 4 && j < 4 && i > -1 && j > -1) {
            return this.#men[i][j]            
        } else {
            throw new Error(`idx out of bound ${i},${j}`)
        }
    }
    /**
     * Getter of number of female heir, validasi 0 <= i,j < 3
     * @param {number} i - index of row (power of heir)
     * @param {number} j - index of column (darajah of heir)
     * @returns {number} number of heir with (power,darajah) === (i,j)
     */
    getWoman(i,j){
        if (i < 3 && j < 3 && i > -1 && j > -1) {
            return this.#women[i][j]            
        } else {
            throw new Error(`idx out of bound ${i},${j}`)
        }
    }
    /**
     * Setter of number of male heir
     * @param {number} i - index of row (power of heir)
     * @param {number} j - index of column (darajah of heir)
     * @param {number} c new value to assign
     * @returns {number} number of heir with (power,darajah) === (i,j)
     */
    setMan(i,j,c){
        if (i < 4 && j < 4 && i > -1 && j > -1) {
            this.#men[i][j] = c        
        } else {
            throw new Error('idx out of bound')
        }
    }
    /**
     * Setter of number of female heir, validasi 0 <= i,j < 3
     * @param {number} i - index of row (power of heir)
     * @param {number} j - index of column (darajah of heir)
     * @param {number} c new value to assign
     * @returns {number} number of heir with (power,darajah) === (i,j)
     */
    setWoman(i,j,c){
        if (i < 3 && j < 3 && i > -1 && j > -1) {
            this.#women[i][j] = c
        } else {
            throw new Error('idx out of bound')
        }
    }
    /**
     * Increment 1 the number of specific heirs
     * @param {number} i row index
     * @param {number} j column index
     * @param {bool} gender heir's gender
     */
    increament(i,j,gender){
        if (gender) {
            this.#men[i][j] += 1
        } else {
            this.#women[i][j] += 1
        }
    }
    /**
     * Decrement 1 the number of specific heirs
     * @param {number} i row index
     * @param {number} j column index
     * @param {bool} gender heir's gender
     */
    decreament(i,j,gender){
        if (gender) {
            this.#men[i][j] -= 1
        } else {
            this.#women[i][j] -= 1
        }
    }
    /**
     * Return last content of warisatan and delete it from warisatan
     * @returns {Waris} heir in last idx of warisatan
     */
    pop(){
        let waris = this.warisatan.pop()
        if (waris.power === 2){
            if (waris.darajah === 2) {
                this.decreament(waris.power, waris.darajah, false)
            } else if (waris.darajah > 2){
                let x = waris.gender ? waris.darajah-1 : waris.darajah
                this.decreament(waris.power, x, waris.gender)
            } else {
                this.decreament(waris.power, waris.darajah, waris.gender)
            }
        } else if (waris.power > -1) {
            this.decreament(waris.power, waris.darajah, waris.gender)
        }
        if (waris.isPartner) {
            this.numPartner--
        }
        if (waris.power === 4 && waris.darajah === 0) {
            this.numLiberator--
        }
        return waris;
    }
    /**
     * Add an heir to warisatan. Add container that corresponding to heir
     * @param {Waris} waris heir
     */
    push(waris){        
        if (waris.isPartner){
            if (waris.gender === this.muwaris.gender) {
                throw new Error(`LGBT is haram`)
            }
            if ( this.muwaris.gender && this.numPartner < 4 || (!this.muwaris.gender && !this.numPartner) ) {
                this.numPartner++
            } else {
                throw new Error(`Partner not allowed greater then ${this.numPartner}`)
            }
        }
        if (waris.power > 3 && waris.darajah > 1) {
            throw new Error('Not a heir')
        }
        if (waris.power === 1 && waris.darajah === 0 && (waris.gender ? this.getMan(1,0) : this.getWoman(1,0)) > 0) {
            throw new Error(`Muwaris only has 1 (one) ${waris.gender ? 'father' : 'mother'}.`)
        }
        if (waris.power === 4 && waris.darajah === 0) {
            this.numLiberator++
        }
        if (waris.power === 2){
            if (waris.darajah === 2) {
                this.increament(waris.power,waris.darajah,false)
            } else if (waris.darajah > 2){
                let x = waris.gender ? waris.darajah-1 : waris.darajah
                this.increament(waris.power, x, waris.gender)
            } else {
                this.increament(waris.power, waris.darajah, waris.gender)
            }
        } else if (waris.power < 4) {
            this.increament(waris.power, waris.darajah, waris.gender)
        }
        this.warisatan.push(waris)
    }    
    /**
     * Delete a heir with corresponding index in warisata
     * @param {number} idx index of heir
     */
     delete(idx){
        let waris = this.warisatan.at(idx)
        this.warisatan = this.warisatan.filter((v, i) => i !== idx)
        if (waris.power === 2){
            if (waris.darajah === 2) {
                this.decreament(waris.power, waris.darajah, false)
            } else if (waris.darajah > 2){
                let x = waris.gender ? waris.darajah-1 : waris.darajah
                this.decreament(waris.power, x, waris.gender)
            } else {
                this.decreament(waris.power, waris.darajah, waris.gender)
            }
        } else if (waris.power < 4) {
            this.decreament(waris.power, waris.darajah, waris.gender)
        }
        if (waris.isPartner) {
            this.numPartner--
        }
        if (waris.power === 4 && waris.darajah === 0) {
            this.numLiberator--
        }
        return waris
    }
    /**
     * Evaluate portion of all heirs
     * @returns {{result: Array<{siham: Fraction, waris: Waris}>, inisialBaseProb: number, finalBaseProb: number}} list of heirs portion
     */
    evaluate(){
        const baseProb = this.getBaseProb()
        const tashih = this.getTashih()
        let result = []        
        let sum = new Fraction(0)
        // count the decrease of base prob
        this.warisatan.forEach((waris, idx) => {
            sum = sum.add(this.getFurud(idx).div(this.getFriends(idx)))
        });
        const aulRadd = this.isNoAshabah() || sum.compare(1) > 0 ? sum.mul(this.getBaseProb()).valueOf() : 0
        let data = this.caclcSaham()
        const relList = json.relList
        data.forEach((val, idx) => {
            let i = this.warisatan[idx].isPartner || this.warisatan[idx].power > 3 ? 7 : this.warisatan[idx].gender ? this.warisatan[idx].power : this.warisatan[idx].power + 4
            let j = this.warisatan[idx].isPartner ? 2 : this.warisatan[idx].darajah
            let rel = relList[i][j]
            // let rel = `${this.warisatan[idx].relation} ${this.warisatan[idx].gender} ${this.warisatan[idx].isPartner}`
            const id = result.findIndex(r => !r.relation.localeCompare(rel))
            if (id >= 0) {
                result[id].waris.push(this.warisatan[idx])
            } else {
                result[result.length] = {relation: rel ,furud: this.getFurud(idx), siham: val, waris : [this.warisatan[idx]]}
            }
        })
        return { result, baseProb, tashih, aulRadd }
    }
    /**
     * Calculate the portion of each heir in warisatan
     * @returns {Array<Fraction>} saham (portion) of each heir
     */
    caclcSaham(){
        let saham = [];
        //ahlul furud
        if (this.isRadd()) {
            let newProb = new Fraction(1)
            let sum = new Fraction(0)
            // count the decrease of base prob
            this.warisatan.forEach((waris, idx) => {
                if (!waris.isPartner) {
                    newProb = newProb.lcm(this.getFurud(idx).d)
                    sum = sum.add(this.getFurud(idx).div(this.getFriends(idx)))
                }
            });
            newProb = newProb.n;
            //add remainder to heirs except partner
            this.warisatan.forEach((waris, idx) => {
                if (waris.isPartner) {                    
                    saham[idx] = this.getFurud(idx).div(this.getFriends(idx))
                } else {                    
                    saham[idx] = this.getFurud(idx).add(this.getFurud(idx).mul(newProb).div(sum.mul(newProb)).mul(this.getRemainder()/this.getBaseProb())).div(this.getFriends(idx))
                }
            })
        } else if(this.isAul()) {
            let sum = new Fraction(0)
            this.warisatan.forEach((waris, idx) => {
                sum = sum.add(this.getFurud(idx).div(this.getFriends(idx)))
            });
            const newProb = sum.mul(this.getBaseProb())
            this.warisatan.forEach((waris, idx) => {
                saham[idx] = this.getFurud(idx).mul(this.getBaseProb()/this.getFriends(idx)).div(newProb)
            });
        } else {
            if (this.isUmaratain()) { //umaratain
                const partnerIdx = this.warisatan.findIndex(waris => waris.isPartner)
                const remain = this.getFurud(partnerIdx).sub(1).mul(-1)
                this.warisatan.forEach((waris, idx) => {
                    if (waris.isPartner || !(waris.power === 1 && waris.darajah === 0)) {
                        saham[idx] = this.getFurud(idx).div(this.getFriends(idx))
                    } else {
                        saham[idx] = waris.gender ? remain.mul(2/3) : remain.mul(1/3)
                    }
                })
            } else if (this.isSiblingsCase()) {
                //default: grand father is ashabah, Furud === 0
                const oneSixth = new Fraction(1/6)
                const oneThird = new Fraction(1/3).mul(this.getRemainder()/this.getBaseProb())
                const muqasamah = new Fraction(2/(2*this.getMan(1,1) + 2*this.getMan(2,0) + 2*this.getMan(2,1) + this.getWoman(2,0) + this.getWoman(2,1))).mul(this.getRemainder()/this.getBaseProb())
                //add remainder to heirs except partner
                const isOneSixth = (oneSixth.compare(oneThird) > 0 && oneSixth.compare(muqasamah)) > 0 || (this.getRemainder()/this.getBaseProb() === 1 && oneSixth.compare(muqasamah) > 0)
                const isOneThird = oneSixth.compare(oneThird) <= 0 && oneThird.compare(muqasamah) > 0 && this.getRemainder()/this.getBaseProb() < 1
                const isMuqasamah = (oneThird.compare(muqasamah) <= 0 && oneSixth.compare(muqasamah) <= 0) || (this.getRemainder()/this.getBaseProb() === 1 && muqasamah.compare(oneSixth) >= 0)
                let grandFather = new Fraction(0)
                let over = new Fraction(0)
                if (isOneSixth) {
                    grandFather = oneSixth
                    //sum of furud when grand father got minimum portion
                    this.warisatan.forEach((waris, idx) => {
                        if (waris.power === 1 && waris.darajah > 0 && waris.gender && !this.isMahjub(idx)) {
                            over = over.add(1/(6*this.getFriends(idx)))
                        } else {
                            over = over.add(this.getFurud(idx).div(this.getFriends(idx)))
                        }
                    });
                    over = over.sub(1).mul(-1)
                }
                if (isOneThird) {
                    grandFather = oneThird
                    over = over.add((this.getRemainder()/(this.getBaseProb()))).mul(2/3)
                }
                if (isMuqasamah) {
                    grandFather = muqasamah
                    over = over.add((this.getRemainder()/(this.getBaseProb()))).sub(muqasamah)
                }

                this.warisatan.forEach((waris, idx) => {
                    //take ahlul fururd portion                        
                    if (waris.power === 1 && waris.darajah > 0 && waris.gender) {
                        saham[idx] = grandFather.div(this.getFriends(idx))
                    } else {
                        if(this.isAshabah(idx)){
                            let a = waris.gender ? 2 : 1
                            let b = waris.gender ? 1 : 2
                            let siblings =  a*this.getFriends(idx) + b*this.getSiblings(idx)
                            saham[idx] = waris.gender ?  over.mul(2/siblings) : over.div(siblings)
                        } else {
                            saham[idx] = this.getFurud(idx).div(this.getFriends(idx))
                        }
                    }
                })
                // saham[idx] = muqasamah > onesixth ? muqasamah : onesixth
            } else { //normal case
                this.warisatan.forEach((waris, idx) => {
                    saham[idx] = this.getFurud(idx).div(this.getFriends(idx))
                });
                // ashabah
                if (this.getRemainder() > 0) {
                    this.warisatan.forEach((waris,idx) => {
                        if(this.isAshabah(idx)){
                            let a = waris.gender ? 2 : 1
                            let b = waris.gender ? 1 : 2
                            let siblings =  a*this.getFriends(idx) + b*this.getSiblings(idx)
                            saham[idx] = waris.gender ?  new Fraction(this.getRemainder()/this.getBaseProb()).mul(2/siblings) : new Fraction(this.getRemainder()/this.getBaseProb()).div(siblings)
                        }
                    })
                }
            }
        }
        return saham;
    }
    /**
     * Calculate inisial base problem
     * @returns {number} inisial base problem
     */
    getBaseProb(){
        let saham = new Fraction(1)
        for (let i = 0; i < this.warisatan.length; i++) {
            saham = saham.lcm(this.getFurud(i).d);
        }
        return this.isUmaratain() ? saham.n/3 : saham.n
    }
    /**
     * Calculate base problem after aul or ... and all heirs got portion in integer
     * @returns {number} final base problem
     */
    getTashih(){
        //stonks cause of aul or radd
        let x = new Fraction(1);
        const saham = this.caclcSaham()
        saham.forEach(siham => {
            x = x.lcm(siham.d)
        })
        return x.n;
    }
    /**
     * Count remaining siham after ahlul furud got their protion
     * @returns {number} ashabah portion
     */
    getRemainder(){
        let saham = new Fraction(0)
        for (let i = 0; i < this.warisatan.length; i++) {
            saham = saham.add(this.getFurud(i).div(this.getFriends(i)))
        }
        return saham.sub(1).mul(-this.getBaseProb()).valueOf()
    }
    /**
     * Count portion of ahlul furdu (definite portion), return 0 for not ahlul furud
     * @param {number} idx index of heir in warisatan
     * @returns {Fraction} portion of ahlul furud heir
     */
    getFurud(idx) {
        /**
         * @type {Fraction} portion of ahlul furud heir
         */
        let x = new Fraction(0)
        const waris = this.warisatan[idx]
        //partner
        if (waris.isPartner) {
            if (waris.gender) {                
                x = this.isNoFarun() ? x.add(1/2) : x.add(1/4)
            } else {
                x = this.isNoFarun() ? x.add(1/4) : x.add(1/8)
            }
        } else if (!this.isMahjub(idx) && !this.isAshabah(idx)) { //not a mahjub
            if (waris.gender) {
                //male
                if (waris.power === 1) { // father-grand father
                    x = x.add(1/6)
                } else {                    
                    if ((waris.power === 2 && waris.darajah === 2)) {
                        x = this.#women[2][3] > 1 ? x.add(1/6) : x.add(1/3)//brother in mother
                    }
                }
            } else {
                //female
                switch (waris.power*10 + waris.darajah) {
                    case 0: //daughter
                        x = this.isLonly(idx) ? x.add(1/2) : x.add(2/3)
                        break;
                    case 1: //grand child - so on
                    case 2:
                        let count = 0, i = 0;
                        while (i < waris.darajah) {
                            count += this.getWoman(waris.power, i)
                            i++;
                        }
                        if (!count) {
                            x = this.isLonly(idx) ? x.add(1/2) : x.add(2/3)
                        } else if (count === 1) { //perfection 2/3
                            x = x.add(1/6)
                        }
                        break;
                    case 10:    //mother
                    let siblings = 0
                    this.#men[2].forEach(sibling => {
                        siblings += sibling
                    })
                    this.#women[2].forEach(sibling => {
                        siblings += sibling
                    })
                        x =(this.isNoFarun() && siblings < 2) ? x.add(1/3) :x.add(1/6)
                        break;
                    case 11: //granny
                    case 12:
                        x = x.add(1/6)
                        break;
                    case 20: //sister
                        if (this.isKalalah()) {
                            x = this.isLonly(idx) ? x.add(1/2) : x.add(2/3)
                        }
                        break;
                    case 21: //sister in father
                        if (this.isKalalah()) {
                            if (!this.getWoman(2,0)) { //replace sister place
                                x = this.isLonly(idx) ? x.add(1/2) : x.add(2/3)
                            } else if (this.getWoman(2,0) === 1) {  //perfection 2/3 for sisters                      
                                x = x.add(1/6)
                            }
                        }
                        break;
                    case 22: //sister in mother
                        x = (this.isLonly(idx)) ? x.add(1/6) : x.add(1/3)
                        break;
                    default:
                        break;
                }
            }
        }
        return x;
    }
    /**
     * Returns is Aul, increas the base problem because sum protion of ahlul furud greater then the inheritance
     * @returns {bool} is Aul
     */
    isAul() {
        return this.getRemainder() < 0
    }
    /**
     * Return is this is Radd, absence of ashabah but inheritance still remaining so base problem decreas
     * @returns {bool} is radd
     */
    isRadd() {
        return this.getRemainder() > 0 && this.isNoAshabah()
    }

    /**
     * Case of umaratain, when mother got 1/3 with father ashabah and there is/are partner(s)
     * Mother got more than father and this is not the inheritance concept, so mother got 1/3 of the remaining after partner take his/her.
     * This make father (male) got 2 times mother (female) portion
     * @returns {bool} is case umaratain
     */
    isUmaratain() {
        let siblings = 0
        this.#men[2].forEach(sibling => {
            siblings += sibling
        })
        this.#women[2].forEach(sibling => {
            siblings += sibling
        })
        return this.isNoFarun() && siblings < 2 && this.numPartner > 0 && this.getMan(1,0) > 0
    }

    /**
     * Case when brothers and sisters with grandfather
     * @returns {bool} siblings and grandfather case
     */
    isSiblingsCase() {
        return this.isNoBoy() && this.getMan(1,0) === 0 && !this.isNoAshlun() &&  (this.getMan(2,0) + this.getMan(2,1) + this.getWoman(2,0) + this.getWoman(2,1)) > 0
    }

    /**
     * Check am heir an ashabah (remaining reciver) or not
     * @param {number} idx index of heir in warisatan
     * @returns {bool} is an heir ashabah
     */
    isAshabah(idx) {
        const waris = this.warisatan[idx]
        const bilGhairi = waris.power < 4 && (this.getMan(waris.power, waris.darajah) > 0 || (waris.power === 0 && waris.darajah > 0 && !this.isNoBoy()))
        const maalGhairi = this.isNoBoy() && !this.isKalalah() && waris.power === 2 && waris.darajah < 2
        if (waris.power === 1) {
            return !this.isMahjub(idx) && waris.gender && this.isNoBoy()
        } else {            
            return !this.isMahjub(idx) && (waris.gender || bilGhairi || maalGhairi)
        }
    }

    /**
     * Check mahjub (blocking from got the inheritance)
     * @param {number} idx index of heir in warisatan
     * @returns {bool}  is an heir mahjub
     */
    isMahjub(idx) {
        /**
         * @type {bool} founded who block the heir from inheritance
         */
        let found = true
        const waris = this.warisatan[idx]
        if (waris.power > 3) { //liberator - none family partner
            //is there any family or wife/husband
            if (waris.darajah < 2) {                
                this.#men.forEach(v => {
                    found = v.every(s => s===0) && found
                    if (!found) {
                        return !found
                    }
                })
                this.#women.forEach(v => {
                    found = v.every(s => s===0) && found
                    if (!found) {
                        return !found
                    }
                })
                return waris.isPartner ? !found : !found && this.numPartner > 0
            } else {
                return true
            }
        }
        found = false
        //family case
        if (waris.gender) { //male
            //find blocker base on power of bone of relation
            //children and parent no need to check blocker by power
            if (waris.power > 2) {
                let i = 0;
                while (i < waris.power && !found) { 
                    //check i-th column
                    found = !(this.#men[i].every(x => x === 0))
                    i++;
                }
                found = found || (!this.isKalalah() && (this.getWoman(2,0) > 0 || this.getWoman(2,1) > 0)) //sister's ashabah maal ghairi
            }
            //find blocker base on darajah (degree) of bone of relation in the same power
            let i = 0;
            //case for nephew, cause they store in #men[power][darajah-1]
            let n = waris.power === 2 && waris.darajah > 2 ? waris.darajah - 1 : waris.darajah
            while (i < n && !found) {
                found = this.getMan(waris.power, i) > 0
                i++
            }
            //siblings and grand father: siblings cases
            if (waris.power === 2) {
                switch (waris.darajah) {
                    case 0:
                        found = this.getMan(1,0) > 0 || !this.isNoBoy();                        
                        break;
                    case 1: //brother in father                        
                        found = this.getMan(1,0) > 0 || !this.isNoBoy() || this.getMan(2,0) > 0 || (!this.isKalalah() && this.getWoman(2,0) > 0)
                        break;
                    default: //brother in mother
                        found = !this.isKalalah();
                        break;
                }
            }
        } else { //female
            let connection = waris.power*10 + waris.darajah;
            switch (connection) {
                case 1: //grandchild
                case 2: //great-grandchild
                    let i = 0;
                    let c = 0
                    while (i < waris.darajah && !found){
                        found = this.getMan(0,i) > 0;
                        c += this.getWoman(0,i)
                        i++
                    }
                    found = found || c > 1
                    break;
                case 11:    //nenek
                    found = this.getWoman(1,0) > 0;
                    break;
                case 20:    //saudari
                    found = !this.isNoBoy() || (this.getMan(1,0) > 0);
                    break;
                case 21:    //saudari seayah
                    found = !this.isNoBoy() || (this.getMan(1,0) > 0) || (this.getMan(2,0) > 0) || (this.getWoman(2,0) === 1 && !this.isKalalah()) || (this.getWoman(2,0) > 1 && this.getSiblings(idx) === 0)
                    break;
                case 22:    //saudara seibu
                    found = !this.isKalalah();
                    break;
                default:
                    found = false;
                    break;
            }
        }
        return found;
    }
   /**
    * Check far'un (descendants) male or female
    * @returns {bool} absence of descendants
    */
    isNoFarun() {
        return this.isNoBoy() && (this.#women[0].every(child => child === 0))
    }

   /**
    * Check ashlun (parent) father, grand father from father, ...
    * @returns {bool} absence of parent
    */
    isNoAshlun() {
        return (this.#men[1].every(father => father === 0));
    }

    /**
     * Check male descendants
     * @returns {bool} absence of male descendants
     */
    isNoBoy() {
        return (this.#men[0].every((boy) => boy === 0))
    }

    /**
     * Check ashlun (parent) and farun (descendants)
     * @returns {bool} absence of ashlun and farun
     */
    isKalalah() {
        return this.isNoFarun() && this.isNoAshlun()
    }
    /**
     * Check a female heir is alone in the sam power and darajah. Actually only used for childrens and sisters
     * @param {number} idx - index of heir in this.warisatan
     * @returns {bool} heir is alone
     */
    isLonly(idx){
        const waris = this.warisatan[idx]
        return this.gender? this.getMan(waris.power, waris.darajah) === 1 : this.getWoman(waris.power, waris.darajah) === 1
    }
    /**
     * Count number of heirs in same power and darajah of heir
     * @param {number} idx index of heir in warisatan
     * @returns number of heirs
     */
    getFriends(idx){
        const waris = this.warisatan[idx]
        if (waris.isPartner) {
            return this.numPartner
        } else if (waris.power > 3) {
            return waris.darajah === 0 ? this.numLiberator : 1
        } else {
            if (waris.power === 2){
                if (waris.darajah === 2) {
                    return this.getWoman(2,2)
                } else if (waris.darajah > 2){
                    let x = waris.gender ? waris.darajah-1 : waris.darajah
                    return waris.gender ? this.getMan(waris.power, x) : this.getWoman(waris.power, x)
                }
            }
            return waris.gender ? this.getMan(waris.power, waris.darajah) : this.getWoman(waris.power, waris.darajah)
        }
    }
    /**
     * Count heir sibling, the heirs with same power and darajah. with opposite gender
     * @param {number} idx heir's idx in warisatan
     * @returns number of heirs sibling
     */
    getSiblings(idx){
        const waris = this.warisatan[idx]
        if (waris.isPartner && waris.power > 3) {
            return this.numPartner - 1
        } else if (waris.power === 4 && waris.darajah === 0){
            return this.numLiberator - 1
        } else if (waris.power < 3 && waris.darajah < 3){
            if (waris.power === 0 && waris.darajah > 0) {
                let c = 0
                if (waris.gender) {
                    if (this.getWoman(0,0) === 0) {
                        const id = this.#women[0].findIndex(child => child > 0)
                        if (id > -1) {
                            c = this.getWoman(0,id)
                        }
                    }
                } else if (!this.isMahjub(idx)) {
                    const id = this.#men[0].findIndex(child => child > 0)
                    if (id > -1) {                        
                        c = this.getMan(0,id)
                    }
                }
                return c
            }
            return waris.gender ?  this.getWoman(waris.power, waris.darajah) : this.getMan(waris.power, waris.darajah)
        } else {
            return 0
        }
    }
    /**
     * Check is there an ashabah
     * @returns {bool} absence of ashabah
     */
    isNoAshabah(){
        let found = false
        let i = 0
        do {
            found = !this.#men[i].every(waris => waris === 0)
            i++
        } while (!found && i < this.#men.length);
        return !found && (this.isKalalah() || (this.getWoman(2,0) + this.getWoman(2,1)) === 0)
    }
    /**
     * Clear the calculator. Set calculator to inisial state
     */
    clear(){        
        while(this.warisatan.length > 0) {
            this.pop()
        }
    }
}
export default CalcWaris;