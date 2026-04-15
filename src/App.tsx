import { useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, User as FirebaseUser } from 'firebase/auth';
import { collection, onSnapshot, query, where, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      
      if (currentUser) {
        // Ensure user document exists
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          gayaWalletAddress: `GAYA_${currentUser.uid.slice(0, 8)}`, // Mock Gaya wallet address
          balanceLux: 1000, // Starting balance
          lastLogin: serverTimestamp()
        }, { merge: true });
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && isAuthReady) {
      const q = query(collection(db, 'users'), where('uid', '==', user.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          setUserProfile(snapshot.docs[0].data());
        }
      });
      return () => unsubscribe();
    }
  }, [user, isAuthReady]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <ErrorBoundary>
      <div className="h-screen w-screen overflow-hidden bg-bg text-text-primary font-sans grid grid-cols-[240px_1fr_320px] grid-rows-[60px_1fr_200px]">
        <header className="col-span-3 border-b border-border flex items-center justify-between px-6 bg-panel">
          <div className="flex items-center gap-3 font-bold uppercase text-sm tracking-wide">
            <div className="w-6 h-6 rounded-full bg-[radial-gradient(circle,var(--color-accent)_0%,#7e3b12_100%)] shadow-[0_0_10px_rgba(242,125,38,0.2)]"></div>
            Hyperfusion Luminal
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="bg-white/5 px-3 py-1.5 rounded-full border border-border text-[11px] text-text-secondary">
                  GAYA_ID: <span className="text-accent font-bold">{userProfile?.gayaWalletAddress || '...'}</span>
                </div>
                <div className="bg-white/5 px-3 py-1.5 rounded-full border border-border text-[11px] text-text-secondary">
                  BAL: <span className="text-accent font-bold">{userProfile?.balanceLux?.toLocaleString() || '0'} LUX</span>
                </div>
                <button className="bg-accent text-black border-none px-4 py-2 rounded font-bold text-[11px] cursor-pointer hover:opacity-90 transition">
                  MINT NEW SEED
                </button>
                <button 
                  onClick={() => auth.signOut()}
                  className="text-text-muted hover:text-text-primary text-[11px] uppercase tracking-wider transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <button 
                onClick={handleLogin}
                className="bg-accent text-black border-none px-6 py-2 rounded font-bold text-[11px] cursor-pointer hover:opacity-90 transition"
              >
                CONNECT GAYA WALLET
              </button>
            )}
          </div>
        </header>

        <nav className="row-start-2 row-end-4 border-r border-border p-6 flex flex-col gap-2">
          <div className="text-[10px] uppercase text-text-muted tracking-[1.5px] mb-2 mt-4">Ecosystem</div>
          <div className="px-3 py-2 rounded text-[13px] text-text-secondary cursor-pointer flex items-center gap-2.5 bg-accent/10 text-accent font-semibold">Marketplace</div>
          <div className="px-3 py-2 rounded text-[13px] text-text-secondary cursor-pointer flex items-center gap-2.5">Multi-Chain Bridge</div>
          <div className="px-3 py-2 rounded text-[13px] text-text-secondary cursor-pointer flex items-center gap-2.5">Exchange & Swaps</div>
          
          <div className="text-[10px] uppercase text-text-muted tracking-[1.5px] mb-2 mt-4">DeFi Protocols</div>
          <div className="px-3 py-2 rounded text-[13px] text-text-secondary cursor-pointer flex items-center gap-2.5">Lending & Borrow</div>
          <div className="px-3 py-2 rounded text-[13px] text-text-secondary cursor-pointer flex items-center gap-2.5">Wealth Strategies</div>
          
          <div className="text-[10px] uppercase text-text-muted tracking-[1.5px] mb-2 mt-4">Systems</div>
          <div className="px-3 py-2 rounded text-[13px] text-text-secondary cursor-pointer flex items-center gap-2.5">Node Management</div>
          <div className="px-3 py-2 rounded text-[13px] text-text-secondary cursor-pointer flex items-center gap-2.5">Deployments</div>
        </nav>

        <main className="col-start-2 row-start-2 p-6 flex flex-col gap-5 overflow-y-auto">
          <div className="flex justify-between items-end">
              <div>
                  <p className="text-[10px] uppercase text-text-muted tracking-[1.5px] m-0">NFT Marketplace</p>
                  <h2 className="text-2xl font-light">Digital Assets Gallery</h2>
              </div>
              <div className="flex gap-2">
                  <span className="bg-white/5 px-3 py-1.5 rounded-full border border-border text-[11px] text-text-secondary">Sort: Lowest Price</span>
                  <span className="bg-white/5 px-3 py-1.5 rounded-full border border-border text-[11px] text-text-secondary">Filter: Star Seeds</span>
              </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
              <div className="bg-panel border border-border rounded-xl p-3 group hover:border-accent/50 transition cursor-pointer">
                  <div className="w-full aspect-square bg-[linear-gradient(45deg,#1a1a20,#2c2c35)] rounded-lg mb-3 relative overflow-hidden">
                    <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition"></div>
                  </div>
                  <div className="text-[13px] mb-1">Plasma Seed #402</div>
                  <div className="flex justify-between text-[11px] text-text-secondary">
                      <span>Floor: 0.42 ETH</span>
                      <span>Lvl: 92.5</span>
                  </div>
              </div>
          </div>
        </main>

        <aside className="col-start-3 row-start-2 row-end-4 border-l border-border p-6 flex flex-col gap-6 bg-white/[0.02] overflow-y-auto">
          <div className="bg-panel border border-border rounded-xl p-4">
              <div className="text-[11px] uppercase text-text-muted mb-3 flex justify-between">
                  <span>Live motog35 Feed</span>
                  <span className="text-[#00ff00]">ONLINE</span>
              </div>
              <div className="font-mono text-[11px] text-[#00ff00] leading-relaxed">
                  [14:22:01] SEED_92_FUSION: STABLE<br/>
                  [14:22:05] BRIDGE_SYNC: SUCCESS<br/>
                  [14:22:09] TRADE_BOT: EXECUTING LONG<br/>
                  [14:22:12] MINT_SIGNAL: PENDING
              </div>
          </div>

          <div className="bg-panel border border-border rounded-xl p-4">
              <div className="text-[11px] uppercase text-text-muted mb-3">Decentralized Lending</div>
              <div className="space-y-3">
                <div className="flex justify-between text-[12px]">
                  <span className="text-text-secondary">Total Deposited</span>
                  <span className="font-bold">$2.4M</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-text-secondary">Net APY</span>
                  <span className="text-[#00ff00] font-bold">12.4%</span>
                </div>
                <button className="w-full py-2 bg-white/5 border border-border rounded text-[11px] font-bold hover:bg-white/10 transition">
                  MANAGE POSITIONS
                </button>
              </div>
          </div>
        </aside>

        <footer className="col-start-2 row-start-3 grid grid-cols-2 border-t border-border bg-panel">
          <div className="p-4 border-r border-border flex flex-col">
              <div className="text-[10px] uppercase text-text-muted tracking-[1.5px] mb-2">Gaya AI Assistant</div>
              <div className="bg-[#1e1e24] p-3 rounded-tr-lg rounded-b-lg text-[12px] leading-relaxed mb-2 border border-border">
                  {user ? `Welcome back, ${user.displayName}. Hyperfusion reaction initiated. Purity is currently at 0.99. Ready to seed star formation.` : "Please connect your Gaya wallet to initiate hyperfusion protocols."}
              </div>
              <input 
                type="text"
                placeholder="Type instructions for wealth strategies..."
                className="mt-auto bg-bg border border-border p-2 rounded text-[11px] text-text-secondary focus:outline-none focus:border-accent/50 transition"
              />
          </div>
          <div className="p-0 bg-black overflow-hidden font-mono text-[11px]">
              <div className="bg-[#1e1e24] p-1 px-3 text-[10px] text-text-muted flex justify-between">
                  <span>Terminal (Python 3.10)</span>
                  <span>bash --live</span>
              </div>
              <div className="p-3 text-[#d1d1d1]">
                  <span className="text-[#c678dd]">class</span> <span className="text-[#61afef]">Hyperfusion</span>:<br/>
                  &nbsp;&nbsp;<span className="text-[#c678dd]">def</span> <span className="text-[#61afef]">activate</span>(self):<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#c678dd]">print</span>(<span className="text-[#98c379]">"Wealth generation live..."</span>)<br/>
                  <br/>
                  <span className="text-[#5c6370]"># Executing star_seed.py</span><br/>
                  <span className="text-[#c678dd]">$</span> python3 activate_wealth.py<br/>
                  <span className="text-accent">&gt;&gt; Success: Bridge connected.</span>
              </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
