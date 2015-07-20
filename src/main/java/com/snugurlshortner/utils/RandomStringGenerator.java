package com.snugurlshortner.utils;

public class RandomStringGenerator {

    public static String generateRandomString(int length, Mode mode) {

        StringBuffer buffer = new StringBuffer();
        String characters = "";

        switch (mode) {

            case ALPHA:
                characters = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ";
                break;

            case ALPHANUMERIC:
                characters = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
                break;

            case NUMERIC:
                characters = "1234567890";
                break;
        }

        int charactersLength = characters.length();

        for (int i = 0; i < length; i++) {
            double index = Math.random() * charactersLength;
            buffer.append(characters.charAt((int) index));
        }
        return buffer.toString();
    }

    public static enum Mode {
        ALPHA, ALPHANUMERIC, NUMERIC
    }
}
