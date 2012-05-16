import java.applet.Applet;
import java.awt.*;          // Imports Button, Canvas, TextArea, TextField
import java.awt.event.*;    // Imports ActionEvent, ActionListener


public class HelloWorldApplet extends Applet {
  
  public void paint(Graphics g) {
     g.drawString("Hello world!", 50, 25);
  }
}
