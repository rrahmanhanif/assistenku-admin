import { db } from "../firebase";
import { collection, addDoc, doc, updateDoc, getDoc } from "firebase/firestore";
import { hitungBiaya } from "./pricing";
import { processPayment } from "../services/finance";
import { sendEmail, pushPopup } from "../services/notify";
