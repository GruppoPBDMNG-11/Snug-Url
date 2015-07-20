package com.snugurlshortner.utils;

import junit.framework.TestSuite;
import junit.framework.TestCase;

import static com.snugurlshortner.utils.RandomStringGenerator.generateRandomString;

/** 
* RandomStringGeneratorTest Tester. 
* 
* @author <Authors name> 
* @since <pre>07/20/2015</pre> 
* @version 1.0 
*/ 
public class RandomStringGeneratorTestTest extends TestCase {


public RandomStringGeneratorTestTest(String name) { 
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
* Method: testGenerateRandomString() 
* 
*/ 
public void testTestGenerateRandomString() throws Exception {
//TODO: Test goes here...

    int lenght = 5;
    String res = generateRandomString(lenght, RandomStringGenerator.Mode.ALPHA);
    boolean verifica = false;
    if (res != null)
        verifica = true;
    assertEquals(true, verifica);
}



public static TestSuite suite() {
return new TestSuite(RandomStringGeneratorTestTest.class);
}
} 
