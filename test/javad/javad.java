
/**

  The author of this software is Ian Kaplan
  Bear Products International
  www.bearcave.com
  iank@bearcave.com

  Copyright (c) Ian Kaplan, 1999, 2000

  See copyright file for usage and licensing

*/

/*

  To generate Java class documentation use

    javadoc -private -author -d doc javad.java attr/*.java classfile/*.java jconst/*.java util/*.java

  if you have a UNIX style shell.  If you don't I recomment getting Bash from
  cygnus.com.  Bash is a UNIX style shell that runs on Windows NT.  Live free
  or die!

 */

package javad;

import java.io.*;
//
// local utility directory, not to be confused with
// java.lang.util.*
//
import util.*;
import classfile.*;

/**
   Dump a compiled Java JVM class file in human readable form.

<p>
   This object is invoked via the constructor, which is passed
   the file name path.

 */
class jvmDump {
  private String fileName;
  private FileInputStream fStream;
  private boolean fileIsOpen = false;


  //
  // jvmDump: class constructor
  //
  jvmDump( String name ) { 
    DataInputStream dStream;

    fileName = name;

    dStream = openFile( name );
    if (dStream != null) {
      classFile curClassFile;

      curClassFile = new classFile( dStream );
      System.out.println();
      curClassFile.pr();
      
      closeFile();
      fileIsOpen = false;
    }
  }  // jvmDump constructor


  private DataInputStream openFile( String name ) {
    DataInputStream dStream;

    // try the file open
    try {
      BufferedInputStream bufStream;

      fStream = new FileInputStream( name );
      bufStream = new BufferedInputStream( fStream );
      dStream = new DataInputStream( bufStream );
      fileIsOpen = true;
    } catch( Exception e ) {
      dStream = null;  // file open did not succeed

      // the constructor can throw either the FileNotFoundException
      // or the SecurityException
      if (e instanceof FileNotFoundException) {
	errorMessage.errorPrint("could not open file " + name );
      }
      else if (e instanceof SecurityException) {
	errorMessage.errorPrint("not allowed to open file " + name );
      }
      else {
	errorMessage.errorPrint(e.toString() + "unexpected exception" );
      }
      fileIsOpen = false;
    } // catch

    return dStream;
  } // openFile


  //
  // closeFile
  //
  private void closeFile() {
    // we're done with the file, so be a good citizen
    // and release the file descriptor.
    try {
      fStream.close();
    } catch (Exception e) {
      if (e instanceof IOException) {
	errorMessage.errorPrint( e.getMessage() );
      }
      else {
	errorMessage.errorPrint(e.toString() + "unexpected exception" );
      }
    } // catch
  } // closeFile


  /**

     Use a finalize method to free up the file descriptor.
     Finalize is always called, even if the object terminates
     with an exception.

   */
  protected void finalize() {
    if (fileIsOpen) {
      closeFile();
    }
  } // finalize

} // jvdDump


/** 

The <b>javad</b> class contains the <i>main</i> for the <i>javad</i>
program.  The <i>javad</i> program reads a Java class file and
writes out a Java like source representation of the class that
generated the file. 

*/
class main {

  static void usage() {
    errorMessage.errorPrint(" this program takes a set of one or more" +
			    " .class file names as its argument");
  }

  public static void main( String[] args ) {

    errorMessage.setProgName( "javad" );

    if (args.length == 0) {
      usage();
    }
    else {
      for (int i = 0; i < args.length; i++) {
	jvmDump dumpObj = new jvmDump( args[i] );
      }
    }
  }
} // main
