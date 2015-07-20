package com.snugurlshortner;

import com.snugurlshortner.Snugurl;
import junit.framework.Test;
import junit.framework.TestSuite;
import junit.framework.TestCase;

/** 
* Snugurl Tester. 
* 
* @author <Authors name> 
* @since <pre>07/20/2015</pre> 
* @version 1.0 
*/ 
public class SnugurlTest extends TestCase { 
public SnugurlTest(String name) { 
super(name); 
} 

public void setUp() throws Exception { 
super.setUp(); 
} 

public void tearDown() throws Exception { 
super.tearDown(); 
} 

/** 
* 
* Method: isValidURL(String str) 
* 
*/ 
public void testIsValidURL() throws Exception { 
//TODO: Test goes here...
    String str="http://www.di.uniba.it";
    boolean res = Snugurl.isValidURL(str);
    assertTrue(res);
}



    /**
* 
* Method: getShortUrl() 
*
*/ 
public void testGetShortUrl() throws Exception { 
//TODO: Test goes here...

/*
    String shorturl= Snugurl.getShortUrl();
    boolean verifica;
    if (shorturl != null)
        verifica = true;
    else
        verifica = false;
    assertEquals(true,verifica);
*/
} 

/** 
* 
* Method: start() 
* 
*/ 
public void testStart() throws Exception { 
//TODO: Test goes here... 
} 



public static Test suite() { 
return new TestSuite(SnugurlTest.class); 
} 
} 
