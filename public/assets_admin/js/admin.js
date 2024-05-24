///////////////////block or unblock///////////

  const unBlock = async(customerid)=>{
    event.preventDefault();
   
    try{
  
      const result = await Swal.fire({
        title: 'UnBlock User',
        text: 'Do you want to unblock an User?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33", 
        confirmButtonText: 'Yes',
        cancelButtonText: 'DISMISS'
        
    });
  
    if(result.value){
  
      const response = await fetch(`/blockUser?customerid=${customerid}`,{
        method: 'POST'
      })
  
      const data = await response.json()
  
      if(data.message = "success"){
        Swal.fire({
          icon: "success",
          title: "User has been unblocked successfully",
          showConfirmButton: true,
          // confirmButtonText: "OK",
          // confirmButtonColor: "#4CAF50",
      });
      // document.getElementById('couponRow' + couponId).innerHTML = ''
      if(result.value){
        
        window.location.href = '/customers'
    }
      }else{
  
        Swal.fire({
          icon: "error",
          title: "Somthing error!!",
          showConfirmButton: true,
          confirmButtonText: "DISMISS",
          confirmButtonColor: "#D22B2B"
          
      });
  
      }
  
    }
  
    }catch(error){
      console.log(error.message);
    }
  }


  const blockUser = async(customerid)=>{
    event.preventDefault();
   
    try{
  
      const result = await Swal.fire({
        title: 'Block User',
        text: 'Do you want to block an User?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33", 
        confirmButtonText: 'Yes',
        cancelButtonText: 'DISMISS'
        
    });
  
    if(result.value){
  
      const response = await fetch(`/blockUser?customerid=${customerid}`,{
        method: 'POST'
      })
  
      const data = await response.json()
  
      if(data.message = "success"){
        Swal.fire({
          icon: "success",
          title: "User has been blocked successfully",
          showConfirmButton: true,
          
      });
      // document.getElementById('couponRow' + couponId).innerHTML = ''
      if(result.value){
        
        window.location.href = '/customers'
    }
      }else{
  
        Swal.fire({
          icon: "error",
          title: "Somthing error!!",
          showConfirmButton: true,
          confirmButtonText: "DISMISS",
          confirmButtonColor: "#D22B2B"
          
      });
  
      }
  
    }
  
    }catch(error){
      console.log(error.message);
    }
  }
 
  /////////////// ORDER UPDATE ////////////////////
  const orderUpdateSelects = document.querySelectorAll('[name="orderUpdate"]')
  const orderId = document.getElementById('order_id_new').value;

  if(orderUpdateSelects){
    orderUpdateSelects.forEach((orderUpdateSelect) => {
    orderUpdateSelect.addEventListener('change', async ()=>{
      console.log("helloo");
      const selectedOption = orderUpdateSelect.value
      const orderId = orderUpdateSelect.id.split('-')[1]

      try {
         console.log("orderupdate script")
        const result = await Swal.fire({
          title: `Confirm Change Order Status to "${selectedOption}"?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33", 
          confirmButtonText: 'Yes, Change',
          cancelButtonText: 'DISMISS'
          
      });

      if(result.value){
        const response = await fetch(`/updateOrder`,{
          method: 'POST',
          headers:{
            'Content-Type' : "application/json"
          },
          body: JSON.stringify({
            status: selectedOption,
            orderId
          })
        })
      
        const data = await response.json()
  
        if(data.message = "Success"){
          const result = await Swal.fire({
            icon: "success",
            title: "Order staus has been changed successfully!!",
            showConfirmButton: true,
            confirmButtonText: "OK",
            confirmButtonColor: "#4CAF50",
        });
      }
      
      if(result.value){
        location.reload()
      } 
      
      }

        
      } catch (error) {
        console.log(error.message);
      }
    })
  })
  }

  /////////////// ADD COUPON ////////////////////

 const addCouponForm = document.getElementById('addCoupon');

 if (addCouponForm){
 
 addCouponForm.addEventListener('submit', async function(event) {
   event.preventDefault();
 
   const form = event.target;
   const formData = new FormData(form);
 
   try {
       const response = await fetch('/addCoupon', {
           method: 'POST',
           body: JSON.stringify(Object.fromEntries(formData)),
           headers: {
             'Content-Type': 'application/json'
           }
         });

         const data = await response.json()
 
     if (data.message === "coupon addedd") {
       const result = await Swal.fire({
           icon: "success",
           title: "New Coupon added Successfully",
           showConfirmButton: true,
           confirmButtonText: "OK",
           confirmButtonColor: "#79a206"
           
       });
           if(result.value){
               form.reset()
               window.location.href = '/viewCoupon'
           }
       
     } else {
       Swal.fire({
           icon: "error",
           title: "Some error occured",
           showConfirmButton: true,
           confirmButtonText: "CANCEL",
           confirmButtonColor: "#D22B2B"
           
       });
     }
   } catch (error) {
     console.log('Error:', error.message);
   }
 });
}

/////////////block coupon///////////////

const blockCoupon = async(couponId)=>{
  try{

    const result = await Swal.fire({
      title: 'Block Coupon',
      text: 'Do you want to block this coupon?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33", 
      confirmButtonText: 'Yes, Block',
      cancelButtonText: 'DISMISS'
      
  });

  if(result.value){

    const response = await fetch(`/blockCoupon?couponId=${couponId}`,{
      method: 'POST'
    })

    const data = await response.json()

    if(data.message = "success"){
      const result = await Swal.fire({
        icon: "success",
        title: "Coupon has been blocked successfully",
        showConfirmButton: true,
        confirmButtonText: "OK",
        confirmButtonColor: "#4CAF50",
    });

    if(result.value){
      location.reload()
    }
    
    }else{

      Swal.fire({
        icon: "error",
        title: "Somthing error!!",
        showConfirmButton: true,
        confirmButtonText: "DISMISS",
        confirmButtonColor: "#D22B2B"
        
    });

    }

  }

  }catch(error){
    console.log(error.message);
  }
}


 /////////////// DELETE COUPON ////////////////////


 const deleteCoupon = async(couponId)=>{
   try{
 
     const result = await Swal.fire({
       title: 'Delete Coupon',
       text: 'Do you want to delete this coupon? \nThis cannot be undo!',
       icon: 'question',
       showCancelButton: true,
       confirmButtonColor: "#3085d6",
       cancelButtonColor: "#d33", 
       confirmButtonText: 'Yes,Delete',
       cancelButtonText: 'DISMISS'
       
   });
 
   if(result.value){
 
     const response = await fetch(`/deleteCoupon?couponId=${couponId}`,{
       method: 'POST'
     })
 
     const data = await response.json()
 
     if(data.message = "success"){
       Swal.fire({
         icon: "success",
         title: "Coupon has been deleted successfully",
         showConfirmButton: true,
         confirmButtonText: "OK",
         confirmButtonColor: "#4CAF50",
     });
     document.getElementById('couponRow' + couponId).innerHTML = ''
     }else{
 
       Swal.fire({
         icon: "error",
         title: "Somthing error!!",
         showConfirmButton: true,
         confirmButtonText: "DISMISS",
         confirmButtonColor: "#D22B2B"
         
     });
 
     }
 
   }
 
   }catch(error){
     console.log(error.message);
   }
 }



   /////////////// ADD OFFER ////////////////////

   const addOfferForm = document.getElementById('addOffer');
   console.log(addOfferForm);

   if (addOfferForm){
       console.log(10);
   addOfferForm.addEventListener('submit', async function(event) {
     event.preventDefault();
   
     const form = event.target;
     const formData = new FormData(form);
   
     try {
         const response = await fetch('/addOffer', {
             method: 'POST',
             body: JSON.stringify(Object.fromEntries(formData)),
             headers: {
               'Content-Type': 'application/json'
             }
           });
  
           const data = await response.json()
   
       if (data.message === "offer addedd") {
         const result = await Swal.fire({
             icon: "success",
             title: "New Offer added Successfully",
             showConfirmButton: true,
             confirmButtonText: "OK",
             confirmButtonColor: "#79a206"
             
         });
             if(result.value){
                 form.reset()
                 window.location.href = '/categoryOffer'
             }
         
       } else {
         Swal.fire({
             icon: "error",
             title: "Some error occured",
             showConfirmButton: true,
             confirmButtonText: "CANCEL",
             confirmButtonColor: "#D22B2B"
             
         });
       }
     } catch (error) {
       console.log('Error:', error.message);
     }
   });
  }
 


  // const orderUpdateSelects = document.querySelectorAll('[name="orderUpdate"]')

  // if(orderUpdateSelects){
  //   orderUpdateSelects.forEach((orderUpdateSelect) => {
  //   orderUpdateSelect.addEventListener('change', async ()=>{
  //     console.log("helloo");
  //     const selectedOption = orderUpdateSelect.value
  //     const orderId = orderUpdateSelect.id.split('-')[1]

  //     try {
  //        console.log("orderupdate script")
  //       const result = await Swal.fire({
  //         title: `Confirm Change Order Status to "${selectedOption}"?`,
  //         icon: 'question',
          
  //         showCancelButton: true,
  //         confirmButtonColor: "#3085d6",
  //         cancelButtonColor: "#d33", 
  //         confirmButtonText: 'Yes, Change',
  //         cancelButtonText: 'DISMISS'
          
  //     });

   
    

  //     if(result.value){
  //       const response = await fetch(`/updateOrder?orderId=${orderId}`,{
  //         method: 'POST',
  //         headers:{
  //           'Content-Type' : "application/json"
  //         },
  //         body: JSON.stringify({
  //           status: selectedOption
  //         })
  //       })
      
  //       const data = await response.json()
  
  //       if(data.message = "Success"){
  //         const result = await Swal.fire({
  //           icon: "success",
  //           title: "Order staus has been changed successfully!!",
  //           showConfirmButton: true,
  //           confirmButtonText: "OK",
  //           confirmButtonColor: "#4CAF50",
  //       });
  //     }
      
  //     if(result.value){
  //       location.reload()
  //     } 
      
  //     }

        
  //     } catch (error) {
  //       console.log(error.message);
  //     }
  //   })
  // })
  // }