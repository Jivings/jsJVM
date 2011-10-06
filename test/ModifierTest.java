public abstract class ModifierTest {
	public void pub() {}
	private void pri() {}
	protected void pro() {}
	final void fin() {}
	
	public final void pubF() {}
	private final void priF() {}
	protected final void proF() {}
	
	public synchronized void pubS() {}
	private synchronized void priS() {}
	protected synchronized void proS() {}
	final synchronized void finS() {}
	
	
	public native void pubN();
	private native void priN();
	protected native void proN();
	final native void finN();
	
	public native synchronized void pubNS();
	private native synchronized void priNS();
	protected native synchronized void proNS();
	final native synchronized void finNS();
	
	abstract void A();
	public abstract void pubA(); 
	protected abstract void proA();
}


