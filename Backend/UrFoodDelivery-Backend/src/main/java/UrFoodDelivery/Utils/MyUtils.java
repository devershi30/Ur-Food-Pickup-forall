package com.UrFoodDelivery.UrFoodDelivery.Backend.Utils;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;

import java.text.SimpleDateFormat;
import java.util.*;

public class MyUtils {

    public static Random random=new Random();

    public static String generateVerificationCode(int charactersCount)
    {
        String code="";
        for(int i=0;i<charactersCount;i++)
        {
            int curr=random.nextInt(10);
            code+=Integer.toString(curr);
        }

        return code;
    }



    private static final ObjectMapper objectMapper=new ObjectMapper();

    public static String createErrorMessage(BindingResult result) {
        try {
        List<FieldError> fieldErrors = result.getFieldErrors();


        Map<String, String> fieldErrorMap = new HashMap<>();
        for (FieldError fError : fieldErrors) {
            fieldErrorMap.put(fError.getField(), fError.getDefaultMessage());
        }

        Map<String, Map<String,String>> errorMessageMap = new HashMap<>();
        errorMessageMap.put("fielderrors", fieldErrorMap);


            return objectMapper.writeValueAsString(errorMessageMap);

//            return result.getAllErrors().toString();

        } catch (Exception e) {
            // Handle the exception (e.g., log it) or throw a more specific exception
            return ""; // Return an empty string or handle the error as needed
        }
    }


    public static String formatDate(Long date)
    {
        Date d=new Date(date);
        SimpleDateFormat simpleDateFormat=new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss");

        return simpleDateFormat.format(d);
    }

    public static Double roundCurrency(Double amount)
    {
        return Math.round(amount*100.00)/100.00;
    }
}
