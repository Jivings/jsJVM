package java.lang;

import java.io.Console;
import java.io.IOException;
import java.nio.channels.Channel;
import java.nio.channels.spi.SelectorProvider;
import javascript.io.JavaScriptPrintStream;
import javascript.io.JavaScriptInputStream;

public class System {
	
	private static native void registerNatives();

	static {
		registerNatives();
	}

	/** Don't let anyone instantiate this class */
	private System() {

	}

	/**
	 * The "standard" input stream. This stream is already open and ready to
	 * supply input data. Typically this stream corresponds to keyboard input or
	 * another input source specified by the host environment or user.
	 */
	public final static JavaScriptInputStream in = nullInputStream();
	/**
	 * The "standard" output stream. This stream is already open and ready to
	 * accept output data. Typically this stream corresponds to display output
	 * or another output destination specified by the host environment or user.
	 * <p>
	 * For simple stand-alone Java applications, a typical way to write a line
	 * of output data is: <blockquote>
	 * 
	 * <pre>
	 * System.out.println(data)
	 * </pre>
	 * 
	 * </blockquote>
	 * <p>
	 * See the <code>println</code> methods in class <code>PrintStream</code>.
	 * 
	 * @see java.io.PrintStream#println()
	 * @see java.io.PrintStream#println(boolean)
	 * @see java.io.PrintStream#println(char)
	 * @see java.io.PrintStream#println(char[])
	 * @see java.io.PrintStream#println(double)
	 * @see java.io.PrintStream#println(float)
	 * @see java.io.PrintStream#println(int)
	 * @see java.io.PrintStream#println(long)
	 * @see java.io.PrintStream#println(java.lang.Object)
	 * @see java.io.PrintStream#println(java.lang.String)
	 */
	public final static JavaScriptPrintStream out = nullPrintStream();

	/**
	 * The "standard" error output stream. This stream is already open and ready
	 * to accept output data.
	 * <p>
	 * Typically this stream corresponds to display output or another output
	 * destination specified by the host environment or user. By convention,
	 * this output stream is used to display error messages or other information
	 * that should come to the immediate attention of a user even if the
	 * principal output stream, the value of the variable <code>out</code>, has
	 * been redirected to a file or other destination that is typically not
	 * continuously monitored.
	 */
	public final static JavaScriptPrintStream err = nullPrintStream();

	/*
	 * The security manager for the system.
	 */
	private static volatile SecurityManager security = null;

	/**
	 * Reassigns the "standard" input stream.
	 * 
	 * <p>
	 * First, if there is a security manager, its <code>checkPermission</code>
	 * method is called with a <code>RuntimePermission("setIO")</code>
	 * permission to see if it's ok to reassign the "standard" input stream.
	 * <p>
	 * 
	 * @param in
	 *            the new standard input stream.
	 * 
	 * @throws SecurityException
	 *             if a security manager exists and its
	 *             <code>checkPermission</code> method doesn't allow reassigning
	 *             of the standard input stream.
	 * 
	 * @see SecurityManager#checkPermission
	 * @see java.lang.RuntimePermission
	 * 
	 * @since JDK1.1
	 */
	public static void setIn(JavaScriptInputStream in) {
		checkIO();
		setIn0(in);
	}

	/**
	 * Reassigns the "standard" output stream.
	 * 
	 * <p>
	 * First, if there is a security manager, its <code>checkPermission</code>
	 * method is called with a <code>RuntimePermission("setIO")</code>
	 * permission to see if it's ok to reassign the "standard" output stream.
	 * 
	 * @param out
	 *            the new standard output stream
	 * 
	 * @throws SecurityException
	 *             if a security manager exists and its
	 *             <code>checkPermission</code> method doesn't allow reassigning
	 *             of the standard output stream.
	 * 
	 * @see SecurityManager#checkPermission
	 * @see java.lang.RuntimePermission
	 * 
	 * @since JDK1.1
	 */
	public static void setOut(JavaScriptPrintStream out) {
		checkIO();
		setOut0(out);
	}

	/**
	 * Reassigns the "standard" error output stream.
	 * 
	 * <p>
	 * First, if there is a security manager, its <code>checkPermission</code>
	 * method is called with a <code>RuntimePermission("setIO")</code>
	 * permission to see if it's ok to reassign the "standard" error output
	 * stream.
	 * 
	 * @param err
	 *            the new standard error output stream.
	 * 
	 * @throws SecurityException
	 *             if a security manager exists and its
	 *             <code>checkPermission</code> method doesn't allow reassigning
	 *             of the standard error output stream.
	 * 
	 * @see SecurityManager#checkPermission
	 * @see java.lang.RuntimePermission
	 * 
	 * @since JDK1.1
	 */
	public static void setErr(JavaScriptPrintStream err) {
		checkIO();
		setErr0(err);
	}

	private static volatile Console cons = null;


	/**
	 * Returns the channel inherited from the entity that created this Java
	 * virtual machine.
	 * 
	 * <p>
	 * This method returns the channel obtained by invoking the
	 * {@link java.nio.channels.spi.SelectorProvider#inheritedChannel
	 * inheritedChannel} method of the system-wide default
	 * {@link java.nio.channels.spi.SelectorProvider} object.
	 * </p>
	 * 
	 * <p>
	 * In addition to the network-oriented channels described in
	 * {@link java.nio.channels.spi.SelectorProvider#inheritedChannel
	 * inheritedChannel}, this method may return other kinds of channels in the
	 * future.
	 * 
	 * @return The inherited channel, if any, otherwise <tt>null</tt>.
	 * 
	 * @throws IOException
	 *             If an I/O error occurs
	 * 
	 * @throws SecurityException
	 *             If a security manager is present and it does not permit
	 *             access to the channel.
	 * 
	 * @since 1.5
	 */
	public static Channel inheritedChannel() throws IOException {
		return SelectorProvider.provider().inheritedChannel();
	}

	private static void checkIO() {
		SecurityManager sm = getSecurityManager();
		if (sm != null) {
			sm.checkPermission(new RuntimePermission("setIO"));
		}
	}

	private static native void setIn0(JavaScriptInputStream in);

	private static native void setOut0(JavaScriptPrintStream out);

	private static native void setErr0(JavaScriptPrintStream err);

	/**
	 * Sets the System security.
	 * 
	 * <p>
	 * If there is a security manager already installed, this method first calls
	 * the security manager's <code>checkPermission</code> method with a
	 * <code>RuntimePermission("setSecurityManager")</code> permission to ensure
	 * it's ok to replace the existing security manager. This may result in
	 * throwing a <code>SecurityException</code>.
	 * 
	 * <p>
	 * Otherwise, the argument is established as the current security manager.
	 * If the argument is <code>null</code> and no security manager has been
	 * established, then no action is taken and the method simply returns.
	 * 
	 * @param s
	 *            the security manager.
	 * @exception SecurityException
	 *                if the security manager has already been set and its
	 *                <code>checkPermission</code> method doesn't allow it to be
	 *                replaced.
	 * @see #getSecurityManager
	 * @see SecurityManager#checkPermission
	 * @see java.lang.RuntimePermission
	 */
	public static void setSecurityManager(final SecurityManager s) {
		try {
			s.checkPackageAccess("java.lang");
		} catch (Exception e) {
			// no-op
		}
		setSecurityManager0(s);
	}

	private static synchronized void setSecurityManager0(final SecurityManager s) {
		
	}

	/**
	 * Gets the system security interface.
	 * 
	 * @return if a security manager has already been established for the
	 *         current application, then that security manager is returned;
	 *         otherwise, <code>null</code> is returned.
	 * @see #setSecurityManager
	 */
	public static SecurityManager getSecurityManager() {
		return security;
	}

	/**
	 * Returns the current time in milliseconds. Note that while the unit of
	 * time of the return value is a millisecond, the granularity of the value
	 * depends on the underlying operating system and may be larger. For
	 * example, many operating systems measure time in units of tens of
	 * milliseconds.
	 * 
	 * <p>
	 * See the description of the class <code>Date</code> for a discussion of
	 * slight discrepancies that may arise between "computer time" and
	 * coordinated universal time (UTC).
	 * 
	 * @return the difference, measured in milliseconds, between the current
	 *         time and midnight, January 1, 1970 UTC.
	 * @see java.util.Date
	 */
	public static native long currentTimeMillis();

	/**
	 * Returns the current value of the most precise available system timer, in
	 * nanoseconds.
	 * 
	 * <p>
	 * This method can only be used to measure elapsed time and is not related
	 * to any other notion of system or wall-clock time. The value returned
	 * represents nanoseconds since some fixed but arbitrary time (perhaps in
	 * the future, so values may be negative). This method provides nanosecond
	 * precision, but not necessarily nanosecond accuracy. No guarantees are
	 * made about how frequently values change. Differences in successive calls
	 * that span greater than approximately 292 years (2<sup>63</sup>
	 * nanoseconds) will not accurately compute elapsed time due to numerical
	 * overflow.
	 * 
	 * <p>
	 * For example, to measure how long some code takes to execute:
	 * 
	 * <pre>
	 * long startTime = System.nanoTime();
	 * // ... the code being measured ...
	 * long estimatedTime = System.nanoTime() - startTime;
	 * </pre>
	 * 
	 * @return The current value of the system timer, in nanoseconds.
	 * @since 1.5
	 */
	public static native long nanoTime();

	/**
	 * Copies an array from the specified source array, beginning at the
	 * specified position, to the specified position of the destination array. A
	 * subsequence of array components are copied from the source array
	 * referenced by <code>src</code> to the destination array referenced by
	 * <code>dest</code>. The number of components copied is equal to the
	 * <code>length</code> argument. The components at positions
	 * <code>srcPos</code> through <code>srcPos+length-1</code> in the source
	 * array are copied into positions <code>destPos</code> through
	 * <code>destPos+length-1</code>, respectively, of the destination array.
	 * <p>
	 * If the <code>src</code> and <code>dest</code> arguments refer to the same
	 * array object, then the copying is performed as if the components at
	 * positions <code>srcPos</code> through <code>srcPos+length-1</code> were
	 * first copied to a temporary array with <code>length</code> components and
	 * then the contents of the temporary array were copied into positions
	 * <code>destPos</code> through <code>destPos+length-1</code> of the
	 * destination array.
	 * <p>
	 * If <code>dest</code> is <code>null</code>, then a
	 * <code>NullPointerException</code> is thrown.
	 * <p>
	 * If <code>src</code> is <code>null</code>, then a
	 * <code>NullPointerException</code> is thrown and the destination array is
	 * not modified.
	 * <p>
	 * Otherwise, if any of the following is true, an
	 * <code>ArrayStoreException</code> is thrown and the destination is not
	 * modified:
	 * <ul>
	 * <li>The <code>src</code> argument refers to an object that is not an
	 * array.
	 * <li>The <code>dest</code> argument refers to an object that is not an
	 * array.
	 * <li>The <code>src</code> argument and <code>dest</code> argument refer to
	 * arrays whose component types are different primitive types.
	 * <li>The <code>src</code> argument refers to an array with a primitive
	 * component type and the <code>dest</code> argument refers to an array with
	 * a reference component type.
	 * <li>The <code>src</code> argument refers to an array with a reference
	 * component type and the <code>dest</code> argument refers to an array with
	 * a primitive component type.
	 * </ul>
	 * <p>
	 * Otherwise, if any of the following is true, an
	 * <code>IndexOutOfBoundsException</code> is thrown and the destination is
	 * not modified:
	 * <ul>
	 * <li>The <code>srcPos</code> argument is negative.
	 * <li>The <code>destPos</code> argument is negative.
	 * <li>The <code>length</code> argument is negative.
	 * <li><code>srcPos+length</code> is greater than <code>src.length</code>,
	 * the length of the source array.
	 * <li><code>destPos+length</code> is greater than <code>dest.length</code>,
	 * the length of the destination array.
	 * </ul>
	 * <p>
	 * Otherwise, if any actual component of the source array from position
	 * <code>srcPos</code> through <code>srcPos+length-1</code> cannot be
	 * converted to the component type of the destination array by assignment
	 * conversion, an <code>ArrayStoreException</code> is thrown. In this case,
	 * let <b><i>k</i></b> be the smallest nonnegative integer less than length
	 * such that <code>src[srcPos+</code><i>k</i><code>]</code> cannot be
	 * converted to the component type of the destination array; when the
	 * exception is thrown, source array components from positions
	 * <code>srcPos</code> through <code>srcPos+</code><i>k</i><code>-1</code>
	 * will already have been copied to destination array positions
	 * <code>destPos</code> through <code>destPos+</code><i>k</I><code>-1</code>
	 * and no other positions of the destination array will have been modified.
	 * (Because of the restrictions already itemized, this paragraph effectively
	 * applies only to the situation where both arrays have component types that
	 * are reference types.)
	 * 
	 * @param src
	 *            the source array.
	 * @param srcPos
	 *            starting position in the source array.
	 * @param dest
	 *            the destination array.
	 * @param destPos
	 *            starting position in the destination data.
	 * @param length
	 *            the number of array elements to be copied.
	 * @exception IndexOutOfBoundsException
	 *                if copying would cause access of data outside array
	 *                bounds.
	 * @exception ArrayStoreException
	 *                if an element in the <code>src</code> array could not be
	 *                stored into the <code>dest</code> array because of a type
	 *                mismatch.
	 * @exception NullPointerException
	 *                if either <code>src</code> or <code>dest</code> is
	 *                <code>null</code>.
	 */
	public static native void arraycopy(Object src, int srcPos, Object dest,
			int destPos, int length);

	/**
	 * Returns the same hash code for the given object as would be returned by
	 * the default method hashCode(), whether or not the given object's class
	 * overrides hashCode(). The hash code for the null reference is zero.
	 * 
	 * @param x
	 *            object for which the hashCode is to be calculated
	 * @return the hashCode
	 * @since JDK1.1
	 */
	public static native int identityHashCode(Object x);

	/**
	 * Terminates the currently running Java Virtual Machine. The argument
	 * serves as a status code; by convention, a nonzero status code indicates
	 * abnormal termination.
	 * <p>
	 * This method calls the <code>exit</code> method in class
	 * <code>Runtime</code>. This method never returns normally.
	 * <p>
	 * The call <code>System.exit(n)</code> is effectively equivalent to the
	 * call: <blockquote>
	 * 
	 * <pre>
	 * Runtime.getRuntime().exit(n)
	 * </pre>
	 * 
	 * </blockquote>
	 * 
	 * @param status
	 *            exit status.
	 * @throws SecurityException
	 *             if a security manager exists and its <code>checkExit</code>
	 *             method doesn't allow exit with the specified status.
	 * @see java.lang.Runtime#exit(int)
	 */
	public static void exit(int status) {
		Runtime.getRuntime().exit(status);
	}

	/**
	 * Runs the garbage collector.
	 * <p>
	 * Calling the <code>gc</code> method suggests that the Java Virtual Machine
	 * expend effort toward recycling unused objects in order to make the memory
	 * they currently occupy available for quick reuse. When control returns
	 * from the method call, the Java Virtual Machine has made a best effort to
	 * reclaim space from all discarded objects.
	 * <p>
	 * The call <code>System.gc()</code> is effectively equivalent to the call:
	 * <blockquote>
	 * 
	 * <pre>
	 * Runtime.getRuntime().gc()
	 * </pre>
	 * 
	 * </blockquote>
	 * 
	 * @see java.lang.Runtime#gc()
	 */
	public static void gc() {
		Runtime.getRuntime().gc();
	}

	/**
	 * The following two methods exist because in, out, and err must be
	 * initialized to null. The compiler, however, cannot be permitted to inline
	 * access to them, since they are later set to more sensible values by
	 * initializeSystemClass().
	 */
	private static JavaScriptInputStream nullInputStream() {
		if (currentTimeMillis() > 0) {
			return null;
		}
		throw new NullPointerException();
	}

	private static JavaScriptPrintStream nullPrintStream()
			throws NullPointerException {
		if (currentTimeMillis() > 0) {
			return null;
		}
		throw new NullPointerException();
	}
}

