package javascript.io;

import java.io.IOException;
import java.io.OutputStream;

public class JavaScriptPrintStream {

	private final String id;
	private final String NEWLINE = "<br />";

	public JavaScriptPrintStream(String id) {
		this.id = id;
	}

	public void write(Object o) {
			this.writeString((String)o, this.id);
	}

	public void println(String s) {
		this.write(s);
	}

	public void println(int i) {
		this.write(Integer.toString(i));
	}

	private native void writeString(String s, String id);
	private native void writeObject(Object o, String id);
}

