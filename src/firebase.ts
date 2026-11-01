import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  getDocs,
  getDocFromServer,
  writeBatch,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';
import { InspectionRecord, Zone } from './types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Must use firestoreDatabaseId from firebase-applet-config.json
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Test connection on boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or initializing:', error.message);
    }
    return false;
  }
}

// Online Real-time Subscriptions
export function subscribeToInspections(
  onData: (inspections: InspectionRecord[]) => void,
  onError?: (err: unknown) => void
) {
  const colRef = collection(db, 'inspections');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const records: InspectionRecord[] = [];
      snapshot.forEach((docSnap) => {
        records.push(docSnap.data() as InspectionRecord);
      });
      // Sort newest first
      records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onData(records);
    },
    (err) => {
      console.error('Error fetching online inspections:', err);
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, 'inspections');
    }
  );
}

export function subscribeToZones(
  onData: (zones: Zone[]) => void,
  onError?: (err: unknown) => void
) {
  const colRef = collection(db, 'zones');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const zonesList: Zone[] = [];
      snapshot.forEach((docSnap) => {
        zonesList.push(docSnap.data() as Zone);
      });
      onData(zonesList);
    },
    (err) => {
      console.error('Error fetching online zones:', err);
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, 'zones');
    }
  );
}

// Online Mutation Helpers
export async function addInspectionOnline(record: InspectionRecord): Promise<void> {
  const path = `inspections/${record.id}`;
  try {
    await setDoc(doc(db, 'inspections', record.id), record);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateInspectionOnline(
  id: string,
  data: Partial<InspectionRecord>
): Promise<void> {
  const path = `inspections/${id}`;
  try {
    await updateDoc(doc(db, 'inspections', id), data);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteInspectionOnline(id: string): Promise<void> {
  const path = `inspections/${id}`;
  try {
    await deleteDoc(doc(db, 'inspections', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function resetAllInspectionsOnline(): Promise<void> {
  const path = 'inspections';
  try {
    const snap = await getDocs(collection(db, 'inspections'));
    const batch = writeBatch(db);
    snap.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function addZoneOnline(zone: Zone): Promise<void> {
  const path = `zones/${zone.id}`;
  try {
    await setDoc(doc(db, 'zones', zone.id), zone);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateZoneOnline(zone: Zone): Promise<void> {
  const path = `zones/${zone.id}`;
  try {
    await setDoc(doc(db, 'zones', zone.id), zone, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteZoneOnline(id: string): Promise<void> {
  const path = `zones/${id}`;
  try {
    await deleteDoc(doc(db, 'zones', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// Initialize default school zones in Firestore if the collection is empty
export async function seedZonesIfEmpty(initialZones: Zone[]): Promise<void> {
  try {
    const snap = await getDocs(collection(db, 'zones'));
    if (snap.empty && initialZones.length > 0) {
      const batch = writeBatch(db);
      initialZones.forEach((z) => {
        batch.set(doc(db, 'zones', z.id), z);
      });
      await batch.commit();
      console.log(`Seeded ${initialZones.length} school zones to Firestore.`);
    }
  } catch (err) {
    console.warn('Could not auto-seed zones into Firestore (will rely on local/state):', err);
  }
}
