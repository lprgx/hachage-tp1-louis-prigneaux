import { readFile, writeFile } from "node:fs/promises";
import { getDate, monSecret } from "./divers.js";
import { NotFoundError } from "./errors.js";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { v4 as uuidv4 } from "uuid";

/* Chemin de stockage des blocks */
const path = join(process.cwd(), "data", "blockchain.json");

/**
 * Mes définitions
 * @typedef { id: string, nom: string, don: number, date: string,hash: string} Block
 * @property {string} id
 * @property {string} nom
 * @property {number} don
 * @property {string} date
 * @property {string} string
 *
 */

/**
 * Renvoie un tableau json de tous les blocks
 * @return {Promise<any>}
 */
export async function findBlocks() {
  try {
    const data = await readFile(path, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error(
      "Erreur lors de la lecture du fichier blockchain.json :",
      error
    );
    throw error;
  }
}

/**
 * Trouve un block à partir de son id
 * @param partialBlock
 * @return {Promise<Block[]>}
 */
export async function findBlock(partialBlock) {
    try {
        const blockchain = await findBlocks();

        // Rechercher le bloc avec l'ID spécifié
        const block = blockchain.find((b) => b.id === partialBlock);

        if (!block) {
            return { error: "Bloc non trouvé." };
        }

        // Si le bloc n'est pas le premier, vérifier son intégrité
        if (blockchain.indexOf(block) > 0) {
            const previousBlock = blockchain[blockchain.indexOf(block) - 1];
            const expectedHash = generateHash(JSON.stringify(previousBlock));

            return {
                ...block,
                isValid: block.hash === expectedHash,
            };
        }

        // Le premier bloc est toujours considéré comme valide
        return { ...block, isValid: true };
    } catch (error) {
        console.error("Erreur lors de la recherche du bloc :", error);
        throw error;
    }
}

/**
 * Trouve le dernier block de la chaine
 * @return {Promise<Block|null>}
 */
export async function findLastBlock() {
  try {
    const blockchain = await findBlocks();
    return blockchain.length > 0 ? blockchain[blockchain.length - 1] : null;
  } catch (error) {
    console.error("Erreur lors de la recherche du dernier bloc :", error);
    throw error;
  }
}

/**
 * Creation d'un block depuis le contenu json
 * @param contenu
 * @return {Promise<Block[]>}
 */
export async function createBlock(contenu) {
    const {nom, don} = contenu;

    if (!nom || !don) {
        throw new Error("Les champs 'nom' et 'don' sont requis.");
    }

    const newBlock = {
        id: uuidv4(),
        nom,
        don,
        date: getDate(),
        hash: null 
    };

    try {
        const blockchain = await findBlocks();

        const lastBlock = await findLastBlock();

        if (lastBlock) {
            const previousHash = generateHash(JSON.stringify(lastBlock));
            newBlock.hash = previousHash;
        } else {
            newBlock.hash = generateHash("Genesis Block");
        }

        blockchain.push(newBlock);

        await writeFile(path, JSON.stringify(blockchain, null, 2), 'utf-8');

        return newBlock;
    } catch (error) {
        console.error("Erreur lors de la création du bloc :", error);
        throw error;
    }
}


/**
 * Génère un hash SHA-256 pour une chaîne donnée
 * @param {string} data
 * @return {string} Hash SHA-256
 */
function generateHash(data) {
    return createHash('sha256').update(data).digest('hex');
}


/**
 * Vérifie l'intégrité de la blockchain.
 * @return {Promise<boolean>} Retourne true si la chaîne est valide, sinon false.
 */
export async function verifBlocks() {
    try {
        const blockchain = await findBlocks();

        if (blockchain.length <= 1) return true;

        for (let i = 1; i < blockchain.length; i++) {
            const currentBlock = blockchain[i];
            const previousBlock = blockchain[i - 1];

            const expectedHash = generateHash(JSON.stringify(previousBlock));

            if (currentBlock.hash !== expectedHash) {
                console.error(`Bloc invalide détecté à l'index ${i}.`);
                return false;
            }
        }

        return true;
    } catch (error) {
        console.error("Erreur lors de la vérification de l'intégrité de la blockchain :", error);
        throw error;
    }
}
