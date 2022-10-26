/**
 * Class to create Muwaris (inheritor) instance
 * @author Panawar Hasibuan
 * @email panawarhsb28@gmail.com
 * @website http://www.lombang.com
 */
class Muwaris {
    /**
     * Constructor of Muwaris, an insheritor
     * @param {bool} gender gender of muwaris, true for male
     * @param {{name: string, maurus: number}} options optional params
     */
    constructor(gender, {name = 'fulan', maurus = 100}={}){
        this.name = name
        this.gender = !!gender
        this.maurus = maurus
    }
}

export default Muwaris