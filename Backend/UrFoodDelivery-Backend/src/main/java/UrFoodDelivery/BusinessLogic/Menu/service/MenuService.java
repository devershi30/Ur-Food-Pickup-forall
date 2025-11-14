package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Menu.service;


import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Menu.entity.Menu;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Menu.entity.MenuFood;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Menu.model.FoodItem;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Menu.model.NewMenuRequest;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Menu.repository.MenuFoodRepository;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Menu.repository.MenuRepository;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.entities.Vendor;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.repositories.VendorRepository;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.services.VendorService;
import com.UrFoodDelivery.UrFoodDelivery.Backend.Utils.model.ResponseFormatWithObject;
import jakarta.validation.Valid;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class MenuService {

    @Autowired
    private MenuRepository menuRepository;

    @Autowired
    private MenuFoodRepository menuFoodRepository;

    @Autowired
    private VendorService vendorService;

    @Autowired
    private VendorRepository vendorRepository;

    public ResponseEntity<List<Menu>> myMenus() {
        Vendor vendor = vendorService.currentVendor();

        List<Menu> menus = getMenusForVendor(vendor);
        return ResponseEntity.ok(menus);
    }

    private List<Menu> getMenusForVendor(Vendor vendor) {
        List<Menu> menus = menuRepository.findByVendorOrderByCreatedOnDesc(vendor);
        return menus;
    }

    public ResponseEntity<List<Menu>> listMenus(UUID vendorId) {
        Optional<Vendor> optionalVendor = vendorRepository.findById(vendorId);
        if(optionalVendor.isEmpty())
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());

        List<Menu> menus = getMenusForVendor(optionalVendor.get());



        return ResponseEntity.ok(menus);
    }

    public ResponseEntity<ResponseFormatWithObject> createMenu(@Valid NewMenuRequest newMenuRequest) {
        Vendor vendor = vendorService.currentVendor();
        List<Menu> menuList = menuRepository.findByVendorAndTitleIgnoreCase(vendor,newMenuRequest.getTitle());
        if(!menuList.isEmpty())
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ResponseFormatWithObject.builder()
                    .error("Menu Already Exists")
                    .build());

        Menu menu = new Menu();

        menu.setTitle(newMenuRequest.getTitle());
        menu.setVendor(vendor);
        menu.setCreatedOn(ZonedDateTime.now());

        menuRepository.saveAndFlush(menu);

        return ResponseEntity.ok(ResponseFormatWithObject.builder()
                .data(menu)
                .message("Menu Created Successfully")
                .build());
    }

    public ResponseEntity<ResponseFormatWithObject> addFoodToMenu(UUID menuId, @Valid FoodItem foodItem) {
        Vendor vendor = vendorService.currentVendor();
        Optional<Menu> optionalMenu = menuRepository.findByUidAndVendor(menuId,vendor);
        if(optionalMenu.isEmpty())
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ResponseFormatWithObject.builder()
                    .error(menuId+" Not Found")
                    .build());

        Menu menu = optionalMenu.get();

        MenuFood menuFood = new MenuFood();

        BeanUtils.copyProperties(foodItem,menuFood);

        menuFood.setMenu(menu);
        menuFood.setCreatedOn(ZonedDateTime.now());
        menuFood.setAvailable(true);

        menuFoodRepository.saveAndFlush(menuFood);
        return ResponseEntity.ok(ResponseFormatWithObject.builder()
                .data(menu)
                .message("Menu Food Added Successfully")
                .build());
    }

    public ResponseEntity<ResponseFormatWithObject> deleteFood(UUID foodId) {
        Vendor vendor = vendorService.currentVendor();

        Optional<MenuFood> optionalMenuFood = menuFoodRepository.findById(foodId);
        if(optionalMenuFood.isEmpty()||!optionalMenuFood.get().getMenu().getVendor().getUid().equals(vendor.getUid()))
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ResponseFormatWithObject.builder()
                    .error(foodId+" Not Found")
                    .build());

        MenuFood menuFood = optionalMenuFood.get();

        menuFoodRepository.delete(menuFood);
        return ResponseEntity.ok(ResponseFormatWithObject.builder()
                .data(menuFood)
                .message("Menu Food Deleted Successfully")
                .build());
    }

    public ResponseEntity<ResponseFormatWithObject> updateFood(UUID foodId, @Valid FoodItem foodItem) {
        Vendor vendor = vendorService.currentVendor();

        Optional<MenuFood> optionalMenuFood = menuFoodRepository.findById(foodId);
        if(optionalMenuFood.isEmpty()||!optionalMenuFood.get().getMenu().getVendor().getUid().equals(vendor.getUid()))
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ResponseFormatWithObject.builder()
                    .error(foodId+" Not Found")
                    .build());

        MenuFood menuFood = optionalMenuFood.get();

        BeanUtils.copyProperties(foodItem,menuFood);

        menuFoodRepository.saveAndFlush(menuFood);
        return ResponseEntity.ok(ResponseFormatWithObject.builder()
                .data(menuFood)
                .message("Menu Food Updated Successfully")
                .build());
    }
}
