package javascript.io;

import java.io.IOException;
import java.io.OutputStream;

public class JavaScriptPrintStream {

	private final String id;
	private final String NEWLINE = "<br />";	

	public JavaScriptPrintStream(String id) {
		this.id = id;
	}

	public void write(String s) {
		this.write0(s, this.id);
	}

	public void println(String s) {
		this.write(s);
	}

	private native void write0(String b, String id);

}

