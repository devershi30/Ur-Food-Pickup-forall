package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.FoodImage.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder



@Entity
public class FoodImage {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID uid;

    private String originalName;

    private ZonedDateTime uploadedOn;

    private UUID reference;

    private String saveFile;


}
