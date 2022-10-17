import { readFile } from 'fs/promises';

const json = JSON.parse(
    await readFile(
      new URL('../utils/relations.json', import.meta.url)
    )
  );
/**
 * Class to create Waris (an heir) instance
 * @author Panawar Hasibuan
 * @email panawarhsb28@gmail.com
 * @website http://www.lombang.com
 */
class Waris{
    /**
     * @static
     * @property {Array<Array<string>>} relations - family relations list that can inherite an inheritor
     */
    static #relations = json.data
    /**
     * Constructor of Waris, an heir
     * @param {bool} gender gender of heir, true for male
     * @param {string} relation family relation
     * @param {string} lang language of relation
     * @param {bool} isPartner is inheritor partner
     * @param {string} name - name of heir
     */
    constructor(gender, relation, lang = 'id', isPartner = false, name = 'Fulan'){        
        /**
         * @property {string} lang language of relation
         */
        this.lang = lang
        const idx = this.#getIdxRelation(relation, this.lang);
        if (isPartner && (idx >= 0 ) && (idx < 32)) {
            throw new Error('Cannot marry a mahram')
        }
        /**
         * @property {string} name name of heir
         */
        this.name = name;
        /**         
         * @property {number} gender gender of heir, true for male
         */
        this.gender = !!gender;
        /**        
         * @property {string} relation family relation with inheritor
         */
        this.relation = relation
        /**
         *  child stronger then grand child in darajah
         * @property {number} darajah degree of heir's relation
         */
        this.darajah = idx%10;
        /**
         * Power of relation to inheritor. not a family relation, set to -1. child stronger then siblings in power
         * @property {number} power power of relation
         */
        this.power = Math.floor(idx/10);
        /**
         * @property {bool} partner is a wife/husband of inheritor
         */
        this.isPartner = !!isPartner;
    }
    /**
     * Count the index of relation based on relations list to get this.power and this.darajah
     * @param {string} relation heir family relation with inheritor
     * @param {string} lang language code of relation
     * @returns {number} index of relation
     */
    #getIdxRelation (relation, lang = 'id') {
        let x = 42
        let family = null
        Waris.#relations.forEach(elmt => {
            if (elmt.lang === lang) {
                family = elmt.relations
                return
            }
        })
        family !== null && family.forEach((elmt,index) => {
            x = (elmt.indexOf(relation)>-1) ? index*10+elmt.indexOf(relation) : x;            
        });
        return x;
    }
    toEn = () => {
        if (this.lang === 'en'){
            return
        }
        Waris.#relations.forEach(elmt => {
            if (elmt.lang === 'en') {
                this.relation = elmt.relations[this.power][this.darajah]
                this.lang = 'en'
                return
            }
        })
    }
    toId = () => {
        if (this.lang === 'id'){
            return
        }
        Waris.#relations.forEach(elmt => {
            if (elmt.lang === 'id') {
                this.relation = elmt.relations[this.power][this.darajah]
                this.lang = 'id'
                return
            }
        })
    }
    /**
     * Check equality of this and waris property
     * @param {Waris} waris heir
     * @returns waris equal to this
     */
    isEqual(waris){
        return (this.name === waris.name) && (this.power === waris.power) && (this.darajah === waris.darajah) &&
        (this.gender === waris.gender) && (this.isPartner === waris.isPartner)
    }
}
export default Waris;
