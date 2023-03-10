import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { nft_asset} from './nft-gallery/nft_asset';
import {
  Observable,
  throwError,
  timer,
  Subscription,
  Subject,
  of,
  BehaviorSubject,
  from
} from "rxjs";
import { switchMap, tap, share, retry, catchError, takeUntil } from "rxjs/operators";


@Injectable({
  providedIn: 'root'
})
export class HttpService {

  httpHeader = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'X-API-KEY': 'API_KEY'
    })
  }  


    opensea_collection_baseURL: string = "https://api.opensea.io/api/v1/assets/";
    private opensea_collection: nft_asset;
    private opensea_search_offset: number = 1;
    private opensea_collection$: Observable<any>;

    private stopPolling = new Subject();
    
    constructor(private http: HttpClient) {
	// hardcoding "seussian" nft collection to be replaced later with GENERIC
	this.opensea_collection$ = timer(1, 3000000).pipe(
	    switchMap(value => this.setOpenSeaCollection("eternal-klay")),
	    retry(),
	    share(),
	    takeUntil(this.stopPolling)
	);


    }

    
    setOpenSeaCollection(collection_name: string): Observable<any> {
	console.log("HttpService -- entering getOpenSeaCollection()")
	return this.http.get(this.opensea_collection_baseURL + collection_name).pipe(
	    retry(1),
	    catchError(this.processError) 
	)
    }

    getOpenSeaCollection(): Observable<number> {
	return this.opensea_collection$;
    }


    //// Error Handling
    processError(err) {
	console.log("HttpService -- entering processError()")
	let message = '';
	if(err.error instanceof ErrorEvent) {
	    message = err.error.message;
	} else {
	    message = `Error Code: ${err.status}\nMessage: ${err.message}`;
	}
	console.log(message);
	return throwError(message);
    }

    
}
