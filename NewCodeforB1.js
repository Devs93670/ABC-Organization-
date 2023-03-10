import { LightningElement,track,wire,api } from 'lwc';
import wagestatus from '@salesforce/apex/wagestatusupdate.amendwagestatus';
import getWages from '@salesforce/apex/wagestatusupdate.getWages';
import { CurrentPageReference,NavigationMixin } from 'lightning/navigation';
import uId from '@salesforce/user/Id';
import accountinfo from '@salesforce/apex/accountid.account';
import SystemModstamp from '@salesforce/schema/Account.SystemModstamp';
export default class ReviewWageDetail extends NavigationMixin(LightningElement) {
    @track wagelist; contributionreport;
    check;
    id;
    acctid;
    wagereport=false;
    disable=true;
    reviewamend=true;
    year;
    quarter;
    @track ssn; //MY Changes To Show DIFF
    @track ssnvalue;
    wageconfirmation=false;
    accPeriodId;
    @track userid=uId;
    demoList=[];
    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
       if (currentPageReference) {
          this.urlStateParameters = currentPageReference.state;
          this.setParametersBasedOnUrl();
       }
    }

    setParametersBasedOnUrl() {
       this.accPeriodId = this.urlStateParameters.recordId;
      
    }
    connectedCallback(){
        var formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          
            // These options are needed to round to whole numbers if that's what you want.
            //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
            //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
        });
        var retrievedData = localStorage.getItem("wagelist");
        let actualData = JSON.parse(retrievedData);
        console.log(localStorage.getItem('userid'));
        console.log('user id >> ', this.userid);
        if (localStorage.getItem('userid')) {
            console.log('from org');
            this.userid = localStorage.getItem('userid');
        }
        accountinfo({id:this.userid}).then(result=>{
            this.acctid = result;
            console.log('account id >> ', this.acctid);
            console.log('Account id >> '+ this.acctid);
            //this.year=localStorage.getItem('year');
            this.year = localStorage.getItem("amendYear");
            console.log('year >> '+ this.year);
            //this.quarter=localStorage.getItem('quarter');
            this.quarter = localStorage.getItem("amendQuarter");
            console.log('quarter >> ' + this.quarter);
            let finalWageList = [];
            getWages({accountId: this.acctid, year :this.year, quarter :this.quarter})
            .then(response =>{
                console.log('res ==>', response);
                this.demoList = response;
                this.wagelist = response;
                console.log('JSON.parse(retrievedData) ==> ',JSON.parse(retrievedData));
                console.log('response old>> ', this.demoList.length);
                console.log('demoList ==> ',this.demoList);
                for(let i = 0; i < this.demoList.length; i++){
                    console.log('demoList ===> ',JSON.stringify(this.demoList[i].Gross_wage_Amt__c)); //MY Changes To Show DIFF
                 var tempGrossAmt = formatter.format(parseInt(this.demoList[i].Gross_wage_Amt__c));
                    var tempTaxAmt = formatter.format(parseInt(this.demoList[i].Taxable_wage_amt__c));
                    var tempamend = this.demoList[i].Amendment_Reason__c;
                    var tempaction=this.demoList[i].Action__c;*/
                    // this.demoList[i].Gross_wage_Amt__c = tempGrossAmt;
                    // this.demoList[i].Taxable_wage_amt__c = tempTaxAmt;
                    // this.demoList[i].Amendment_Reason__c=tempamend;
                    // this.demoList[i].Action__c=tempaction;
                    var tempSSN = this.demoList[i].WageSSN__c;
                    this.demoList[i].WageSSN__c = tempSSN.substring(0, 3) + '-' + tempSSN.substring(3, 5) + '-' + tempSSN.substring(5, 9);
                    for (let j = 0; j < actualData.length; j++){
                        console.log(actualData[j],'\n',this.demoList[i]);
                        if (actualData[j].ssn == this.demoList[i].WageSSN__c){
                            this.demoList[i].Action__c = actualData[j].Action__c;
                            this.demoList[i].Amendment_Reason__c = actualData[j].Amendment_Reason__c;
                            console.log('\n');
                            finalWageList.push(this.demoList[i]);
                        }
                    }
                }
                console.log('finalWageList data---->',finalWageList);
                console.log('response new >> ', this.demoList);
                this.wagelist = finalWageList;
            }).catch(error=>{
                console.log('error >> '+ error);
            })
            console.log('finalWageList data---->',finalWageList);
     this.wagelist = this.demoList;
     this.wagelist = JSON.parse(retrievedData);
            
     for (let i=0;i<this.wagelist.length;i++){
         console.log('Waglist[i] ==> ', this.wagelist[i]);
         for (let j = 0; j < actualData.length; j++){
             console.log('actualData[j] ==> ', actualData[j]);
            if (actualData[j].ssn == this.wagelist[i].WageSSN__c) {
                 var tax=this.wagelist[i].Taxable_wage_amt__c;
                this.wagelist[i].Taxable_wage_amt__c=tax;
                this.accPeriodId=this.wagelist[i].Account_Period__c;
            //             console.log('Account Period Id->',this.accPeriodId);
            //             var gross=this.wagelist[i].Gross_wage_Amt__c;
            //             this.wagelist[i].Gross_wage_Amt__c=gross;

            //             var amend = actualData[j].Amendment_Reason__c;
            //             this.wagelist[i].Amendment_Reason__c=amend;

                        var action = actualData[j].Action__c;
                        this.wagelist[i].Action__c=action;
                    }
                }
                // var tax=this.wagelist[i].Taxable_wage_amt__c;
                
                // this.wagelist[i].Taxable_wage_amt__c=tax;
                // this.accPeriodId=this.wagelist[i].Account_Period__c;
                // console.log('Account Period Id->',this.accPeriodId);
                // var gross=this.wagelist[i].Gross_wage_Amt__c;
                // this.wagelist[i].Gross_wage_Amt__c=gross;

                // var amend = this.wagelist[i].Amendment_Reason__c;
                // this.wagelist[i].Amendment_Reason__c=amend;

                // var action = this.wagelist[i].Action__c;
                // this.wagelist[i].Action__c=action;
            // }
        })
        .catch(error=>{
            console.log('127. error >> '+ error);
        });
        // this.acctid
        console.log('130. wageList ==>',this.wagelist);
    
 }


    handleCheckbox(event){
        this.check=event.target.checked;
        if(this.check==true){
            this.disable=false;
        }
        else{
            this.disable=true;
        }
    }
    handlenext(){
        for(let i=0;i<this.wagelist.length;i++){
            var wageid=this.wagelist[i].Id;

            console.log(wageid);
            wagestatus({id:wageid})
            .then(result => {
                console.log("hii");
                console.log(result);
                
                // set @track employers variable with return emp list from server  
                this.error=false;
                // this.wageconfirmation=true;
                // this.reviewamend = false;
                
                // if (localStorage.getItem('fromOrg') == 'true' || localStorage.getItem('fromOrg') == true) {
                //     // alert('org -> cont');
                //     this.contributionreport = true;
                // }
                // else {
                //     // alert('com -> cont');
                //     this.contributionreport = false;
                //     this[NavigationMixin.Navigate]({
                //         type: 'comm__namedPage',
                //         attributes: {
                //             pageName: 'contribution'
                //         },
                //         state:{
                //             'recordId': this.accPeriodId
                //         }
                //     });
                // }
                
            })
            .catch(error => {
                this.error=error;
            });

            this.reviewamend = false;
                
                if (localStorage.getItem('fromOrg') == 'true' || localStorage.getItem('fromOrg') == true) {
                    // alert('org -> cont');
                    this.contributionreport = true;
                }
                else {
                    // alert('com -> cont');
                    this.contributionreport = false;
                    this[NavigationMixin.Navigate]({
                        type: 'comm__namedPage',
                        attributes: {
                            pageName: 'contribution'
                        },
                        state:{
                            'recordId': this.accPeriodId
                        }
                    });
                }
        }
        
      /*  this.acctid=localStorage.getItem("accid");
        console.log(this.acctid);
        this.template.querySelectorAll('lightning-input-field[data-id="accountid"]').forEach((field)=>{
            field.value = this.acctid;
        });
        this.template.querySelectorAll('lightning-input-field[data-id="type"]').forEach((field)=>{
            field.value = 'Wage Reporting';
        });
      
          this.template
          .querySelectorAll('lightning-record-edit-form')
          .forEach((form) => {
              form.submit();
              console.log()
          });*/

          
    }
    handleSuccess(event)
    {this.id=event.detail.id;
        console.log(this.id);
       // localStorage.setItem("wageconfirmid",this.id);
       


    }
    handlecancel(event)
    {
        this.reviewamend=false;
        this.wagereport=true;
    }
}