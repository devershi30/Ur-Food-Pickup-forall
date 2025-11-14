package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Menu.controller;

import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Menu.entity.Menu;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Menu.model.FoodItem;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Menu.model.NewMenuRequest;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Menu.service.MenuService;
import com.UrFoodDelivery.UrFoodDelivery.Backend.Utils.MyUtils;
import com.UrFoodDelivery.UrFoodDelivery.Backend.Utils.model.ResponseFormatWithObject;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/menu")
public class MenuController {

    @Autowired
    private MenuService menuService;



    @PreAuthorize("hasAuthority('ROLE_VENDOR')")
    @GetMapping("/myMenus")
    public ResponseEntity<List<Menu>> myMenus()
    {
        return menuService.myMenus();
    }

    @GetMapping("/vendorMenus/{vendorId}")
    public ResponseEntity<List<Menu>> vendorMenus(@PathVariable("vendorId")UUID vendorId)
    {
        return menuService.listMenus(vendorId);
    }

    @PreAuthorize("hasAuthority('ROLE_VENDOR')")
    @PostMapping("/createMenu")
    public ResponseEntity<ResponseFormatWithObject> createMenu(@RequestBody @Valid NewMenuRequest newMenuRequest, BindingResult bindingResult)
    {
        if(bindingResult.hasErrors())
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ResponseFormatWithObject.builder().error(MyUtils.createErrorMessage(bindingResult)).build());

        return menuService.createMenu(newMenuRequest);
    }

    @PreAuthorize("hasAuthority('ROLE_VENDOR')")
    @PostMapping("/addFoodToMenu/{menuId}")
    public ResponseEntity<ResponseFormatWithObject> addFoodToMenu(@PathVariable("menuId") UUID menuId,@RequestBody @Valid FoodItem foodItem,BindingResult bindingResult)
    {
        if(bindingResult.hasErrors())
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ResponseFormatWithObject.builder().error(MyUtils.createErrorMessage(bindingResult)).build());
        return menuService.addFoodToMenu(menuId,foodItem);
    }

    @PreAuthorize("hasAuthority('ROLE_VENDOR')")
    @DeleteMapping("/deleteFood/{foodId}")
    public ResponseEntity<ResponseFormatWithObject> deleteFooditem(@PathVariable("foodId") UUID foodId)
    {
        return menuService.deleteFood(foodId);
    }

    @PreAuthorize("hasAuthority('ROLE_VENDOR')")
    @PutMapping("/updateFood/{foodId}")
    public ResponseEntity<ResponseFormatWithObject> updateFood(@PathVariable("foodId") UUID foodId,@RequestBody @Valid FoodItem foodItem,BindingResult bindingResult)
    {
        if(bindingResult.hasErrors())
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ResponseFormatWithObject.builder().error(MyUtils.createErrorMessage(bindingResult)).build());
        return menuService.updateFood(foodId,foodItem);
    }



}
